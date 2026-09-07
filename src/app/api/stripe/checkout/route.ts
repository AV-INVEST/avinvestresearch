import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe/client';
import { resolveProduct } from '@/lib/stripe/pricing';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { siteConfig } from '@/config/siteConfig';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

interface CheckoutPayload {
  slug?: unknown;
}

type StripeCheckoutSession = Stripe.Checkout.Session;

const PENDING_REUSE_WINDOW_MS = 24 * 60 * 60 * 1000;

const inFlightByKey = new Map<string, Promise<Response>>();

function resolveBaseUrl(req: Request): string {
  const PRODUCTION_URL = siteConfig.url.replace(/\/+$/, '');
  const isProduction = process.env.NODE_ENV === 'production';

  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromPublic && typeof fromPublic === 'string' && fromPublic.length > 0) {
    const cleaned = fromPublic.replace(/\/+$/, '');
    if (isProduction) {
      if (cleaned.startsWith('https://avinvestresearch.com')) return cleaned;
      return PRODUCTION_URL;
    }
    return cleaned;
  }

  if (isProduction) {
    return PRODUCTION_URL;
  }

  const origin = req.headers.get('origin');
  if (origin && typeof origin === 'string' && origin.length > 0 && origin.startsWith('http')) {
    return origin.replace(/\/+$/, '');
  }
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const forwardedHost = req.headers.get('x-forwarded-host');
  const host = req.headers.get('host');
  const proto = forwardedProto || (host && host.includes('localhost') ? 'http' : 'https');
  const finalHost = forwardedHost || host;
  if (finalHost) {
    return `${proto}://${finalHost}`.replace(/\/+$/, '');
  }
  return PRODUCTION_URL;
}

interface SafeStripeErrorLog {
  type?: string;
  code?: string;
  message?: string;
  param?: string;
  statusCode?: number;
  requestId?: string;
}

function buildSafeStripeError(err: unknown): SafeStripeErrorLog {
  const out: SafeStripeErrorLog = {};
  if (err instanceof Stripe.errors.StripeError) {
    out.type = err.type;
    out.code = err.code;
    out.message = err.message;
    out.param = err.param;
    out.statusCode = err.statusCode;
    out.requestId = err.requestId;
  } else if (err instanceof Error) {
    out.message = err.message;
  }
  return out;
}

function ownedRedirectResponse() {
  return NextResponse.json(
    {
      error: 'Hai gia acquistato questo percorso.',
      redirectTo: '/area-membri/percorsi',
    },
    { status: 409 },
  );
}

async function checkAlreadySucceeded(userEmail: string, productSlug: string): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const row = await prisma.purchase.findFirst({
      where: { userEmail, productSlug, status: 'succeeded' },
      select: { id: true },
    });
    return Boolean(row);
  } catch {
    return false;
  }
}

async function findReusablePendingSession(
  userEmail: string,
  productSlug: string,
): Promise<{ checkoutSessionId: string } | null> {
  if (!isDatabaseConfigured()) return null;
  try {
    const cutoff = new Date(Date.now() - PENDING_REUSE_WINDOW_MS);
    const row = await prisma.purchase.findFirst({
      where: {
        userEmail,
        productSlug,
        status: 'pending',
        createdAt: { gte: cutoff },
        checkoutSessionId: { not: null } as any,
      },
      orderBy: { createdAt: 'desc' },
      select: { checkoutSessionId: true },
    });
    if (!row || !row.checkoutSessionId) return null;
    return { checkoutSessionId: row.checkoutSessionId };
  } catch {
    return null;
  }
}

async function tryRetrieveOpenSession(
  stripe: Stripe,
  checkoutSessionId: string,
): Promise<StripeCheckoutSession | null> {
  try {
    const session = await stripe.checkout.sessions.retrieve(checkoutSessionId);
    if (session && session.status === 'open') return session;
    return null;
  } catch (err) {
    const safe = buildSafeStripeError(err);
    if (safe.statusCode === 404) return null;
    console.warn('[stripe:checkout] retrieve reusable session failed', safe);
    return null;
  }
}

async function createPendingPurchase(
  userEmail: string,
  productSlug: string,
  checkoutSessionId: string,
  amountTotal: number,
  currency: string,
): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.purchase.create({
      data: {
        userEmail,
        productSlug,
        checkoutSessionId,
        amountTotal,
        currency: String(currency || 'EUR').toUpperCase(),
        status: 'pending',
      },
      select: { id: true },
    });
  } catch (err) {
    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : null;
    if (code === 'P2002') {
      console.warn('[stripe:checkout] pending purchase unique collision, ignoring', {
        checkoutSessionId,
        userEmail,
        productSlug,
      });
      return;
    }
    throw err;
  }
}

async function handleCheckoutInternal(req: Request): Promise<Response> {
  const session = await auth().catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required', loginUrl: '/login?callbackUrl=' + encodeURIComponent('/#percorsi') },
      { status: 401 },
    );
  }

  const userEmail = normalizeEmail(session.user.email);
  if (!userEmail) {
    return NextResponse.json(
      { error: 'Invalid authenticated email' },
      { status: 400 },
    );
  }

  let payload: CheckoutPayload;
  try {
    payload = (await req.json()) as CheckoutPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const resolved = resolveProduct(payload?.slug);
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  if (await checkAlreadySucceeded(userEmail, resolved.slug)) {
    return ownedRedirectResponse();
  }

  let stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    const safeErr = buildSafeStripeError(err);
    console.error('[stripe:checkout] Stripe client init failed', safeErr);
    const message = err instanceof Error ? err.message : 'Stripe non configurato';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const reusable = await findReusablePendingSession(userEmail, resolved.slug);
  if (reusable) {
    const openSession = await tryRetrieveOpenSession(stripe, reusable.checkoutSessionId);
    if (openSession && openSession.url) {
      console.info('[stripe:checkout] reusing open checkout session', {
        sessionId: openSession.id,
        userEmail,
        productSlug: resolved.slug,
      });
      return NextResponse.json({
        url: openSession.url,
        sessionId: openSession.id,
        reused: true,
      });
    }
  }

  const baseUrl = resolveBaseUrl(req);
  const successUrl = new URL('/area-membri', baseUrl);
  successUrl.searchParams.set('checkout', 'success');
  successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

  const cancelUrl = new URL('/#percorsi', baseUrl);
  cancelUrl.searchParams.set('checkout', 'cancelled');

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: userEmail,
    submit_type: 'pay',
    billing_address_collection: 'auto',
    invoice_creation: {
      enabled: true,
    },
    line_items: [
      {
        price: resolved.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      product_slug: resolved.slug,
      user_email: userEmail,
    },
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    automatic_tax: { enabled: true },
    allow_promotion_codes: false,
  });

  if (!checkoutSession.url) {
    console.error('[stripe:checkout] Session created without URL', {
      sessionId: checkoutSession.id,
    });
    return NextResponse.json(
      { error: 'Impossibile creare la sessione di pagamento.' },
      { status: 502 },
    );
  }

  try {
    await createPendingPurchase(
      userEmail,
      resolved.slug,
      checkoutSession.id,
      typeof checkoutSession.amount_total === 'number' ? checkoutSession.amount_total : 0,
      checkoutSession.currency || 'EUR',
    );
  } catch (err) {
    const safe = buildSafeStripeError(err);
    console.error('[stripe:checkout] Failed to persist pending purchase', safe);
  }

  return NextResponse.json({
    url: checkoutSession.url,
    sessionId: checkoutSession.id,
  });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth().catch(() => null);
    const userEmail = normalizeEmail(session?.user?.email);

    let payload: CheckoutPayload | null = null;
    try {
      const cloned = req.clone();
      payload = (await cloned.json()) as CheckoutPayload;
    } catch {
      payload = null;
    }

    const slug = payload && typeof (payload as CheckoutPayload).slug === 'string'
      ? resolveProduct((payload as CheckoutPayload).slug)?.slug
      : null;

    let inFlightKey: string | null = null;
    if (userEmail && slug) {
      inFlightKey = `${userEmail}:${slug}`;
      const existing = inFlightByKey.get(inFlightKey);
      if (existing) {
        console.info('[stripe:checkout] dedup concurrent request via in-memory lock', {
          key: inFlightKey,
        });
        return await existing;
      }
    }

    const pending = handleCheckoutInternal(req);

    if (inFlightKey) {
      inFlightByKey.set(inFlightKey, pending);
      pending.finally(() => {
        inFlightByKey.delete(inFlightKey!);
      });
    }

    return await pending;
  } catch (err) {
    const safeErr = buildSafeStripeError(err);
    console.error('[stripe:checkout] Session creation failed', safeErr);
    const message =
      err instanceof Error && process.env.NODE_ENV === 'development'
        ? err.message
        : 'Si e verificato un errore durante la preparazione del pagamento.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
