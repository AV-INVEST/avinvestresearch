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
  consentTermsVersion?: unknown;
  consentDigitalWithdrawalVersion?: unknown;
  consentAcceptedAt?: unknown;
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

function ownedRedirectResponse(slug: 'foundations' | 'trading-lab' | 'research-club' | 'market-lens' | 'trading-starter') {
  const redirectTo = slug === 'market-lens' || slug === 'trading-starter'
    ? '/area-membri/prodotti'
    : '/area-membri/percorsi';
  const error = slug === 'market-lens'
    ? 'Hai gia acquistato AV Market Lens.'
    : slug === 'trading-starter'
      ? 'Hai gia acquistato AV Trading Starter.'
      : 'Hai gia acquistato questo percorso.';
  return NextResponse.json(
    { error, redirectTo },
    { status: 409 },
  );
}

function ownedRedirectSubscription() {
  return NextResponse.json(
    {
      error: 'Hai gia un abbonamento attivo a AV Research Club.',
      redirectTo: '/area-membri/research-club',
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

async function checkActiveResearchClubSubscription(
  userEmail: string,
): Promise<boolean> {
  if (!isDatabaseConfigured()) return false;
  try {
    const now = new Date();
    const sub = await prisma.subscription.findFirst({
      where: {
        userEmail,
        product: 'AV_RESEARCH_CLUB',
        status: { in: ['INCOMPLETE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED'] },
      },
      select: {
        status: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    if (!sub) return false;
    if (sub.status === 'ACTIVE' || sub.status === 'TRIALING' || sub.status === 'INCOMPLETE' || sub.status === 'PAST_DUE') {
      if (!sub.currentPeriodEnd) return true;
      return sub.currentPeriodEnd.getTime() > now.getTime();
    }
    if (sub.status === 'CANCELED') {
      if (!sub.currentPeriodEnd) return false;
      return sub.currentPeriodEnd.getTime() > now.getTime();
    }
    return false;
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
      },
      orderBy: { createdAt: 'desc' },
      select: { checkoutSessionId: true },
    });
    if (!row) return null;
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
  opts?: {
    consentTermsVersion?: string | null;
    consentDigitalWithdrawalVersion?: string | null;
    consentAcceptedAt?: Date | null;
  },
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
        consentTermsVersion: opts?.consentTermsVersion ?? undefined,
        consentDigitalWithdrawalVersion: opts?.consentDigitalWithdrawalVersion ?? undefined,
        consentAcceptedAt: opts?.consentAcceptedAt ?? undefined,
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

  let payload: CheckoutPayload = {};
  const contentType = (req.headers.get('content-type') || '').toLowerCase();
  try {
    if (contentType.includes('application/json')) {
      payload = (await req.json()) as CheckoutPayload;
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const fd = await req.formData();
      const slugRaw = fd.get('slug');
      const slug = typeof slugRaw === 'string' ? slugRaw : undefined;
      const consentTermsVersion = fd.get('consentTermsVersion');
      const consentDigitalWithdrawalVersion = fd.get('consentDigitalWithdrawalVersion');
      const consentAcceptedAt = fd.get('consentAcceptedAt');
      payload = {
        slug,
        consentTermsVersion: typeof consentTermsVersion === 'string' ? consentTermsVersion : undefined,
        consentDigitalWithdrawalVersion: typeof consentDigitalWithdrawalVersion === 'string' ? consentDigitalWithdrawalVersion : undefined,
        consentAcceptedAt: typeof consentAcceptedAt === 'string' ? consentAcceptedAt : undefined,
      };
    } else {
      payload = (await req.json()) as CheckoutPayload;
    }
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const resolved = resolveProduct(payload?.slug);
  if (!resolved) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  const consentTermsVersion = typeof payload.consentTermsVersion === 'string' && payload.consentTermsVersion.length > 0
    ? payload.consentTermsVersion
    : null;
  const consentDigitalWithdrawalVersion = typeof payload.consentDigitalWithdrawalVersion === 'string' && payload.consentDigitalWithdrawalVersion.length > 0
    ? payload.consentDigitalWithdrawalVersion
    : null;
  let consentAcceptedAt: Date | null = null;
  if (typeof payload.consentAcceptedAt === 'string' && payload.consentAcceptedAt.length > 0) {
    const t = new Date(payload.consentAcceptedAt);
    if (!Number.isNaN(t.getTime())) consentAcceptedAt = t;
  }

  if (resolved.slug === 'market-lens' || resolved.slug === 'trading-starter') {
    const consentVOk = typeof consentTermsVersion === 'string' && /^v[0-9]+(\.[0-9]+)?$/.test(consentTermsVersion);
    const consentDwOk = typeof consentDigitalWithdrawalVersion === 'string' && /^v[0-9]+(\.[0-9]+)?$/.test(consentDigitalWithdrawalVersion);
    const consentAtOk = consentAcceptedAt instanceof Date && !Number.isNaN(consentAcceptedAt.getTime());
    if (!consentVOk || !consentDwOk || !consentAtOk) {
      const productLabel = resolved.slug === 'market-lens' ? 'AV Market Lens' : 'AV Trading Starter';
      return NextResponse.json(
        { error: `Consenso digitale obbligatorio mancante o non valido per ${productLabel}.` },
        { status: 400 },
      );
    }
  } else if (resolved.slug === 'research-club') {
    const consentVOk = typeof consentTermsVersion === 'string' && /^v[0-9]+(\.[0-9]+)?$/.test(consentTermsVersion);
    const consentAtOk = consentAcceptedAt instanceof Date && !Number.isNaN(consentAcceptedAt.getTime());
    if (!consentVOk || !consentAtOk) {
      return NextResponse.json(
        { error: 'Consenso ai termini obbligatorio mancante o non valido per AV Research Club.' },
        { status: 400 },
      );
    }
  }

  if (resolved.billingMode === 'subscription') {
    if (resolved.slug === 'research-club') {
      if (await checkActiveResearchClubSubscription(userEmail)) {
        return ownedRedirectSubscription();
      }
    }
  } else {
    if (await checkAlreadySucceeded(userEmail, resolved.slug)) {
      return ownedRedirectResponse(resolved.slug);
    }
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

  const isSubscription = resolved.billingMode === 'subscription';

  const successPath = isSubscription
    ? '/area-membri/research-club'
    : resolved.slug === 'market-lens' || resolved.slug === 'trading-starter'
      ? '/area-membri/prodotti'
      : '/area-membri';
  const cancelPath = isSubscription
    ? '/#research-club'
    : resolved.slug === 'market-lens'
      ? '/#market-lens'
      : resolved.slug === 'trading-starter'
        ? '/#trading-starter'
        : '/#percorsi';

  const baseSuccessUrl = new URL(successPath, baseUrl);
  baseSuccessUrl.searchParams.set('checkout', 'success');
  const successUrl = baseSuccessUrl.toString() + '&session_id={CHECKOUT_SESSION_ID}';

  const cancelUrl = new URL(cancelPath, baseUrl);
  cancelUrl.searchParams.set('checkout', 'cancelled');

  const commonMetadata: Record<string, string> = {
    product_slug: resolved.slug,
    user_email: userEmail,
    billing_mode: isSubscription ? 'subscription' : 'one_time',
  };
  if ((resolved.slug === 'market-lens' || resolved.slug === 'trading-starter') && consentTermsVersion && consentDigitalWithdrawalVersion && consentAcceptedAt) {
    commonMetadata.consent_terms_v = consentTermsVersion;
    commonMetadata.consent_digital_withdrawal_v = consentDigitalWithdrawalVersion;
    commonMetadata.consent_at = consentAcceptedAt.toISOString();
  } else if (resolved.slug === 'research-club' && consentTermsVersion && consentAcceptedAt) {
    commonMetadata.consent_terms_v = consentTermsVersion;
    commonMetadata.consent_at = consentAcceptedAt.toISOString();
  }

  const commonParams: Stripe.Checkout.SessionCreateParams = {
    customer_email: userEmail,
    line_items: [
      {
        price: resolved.priceId,
        quantity: 1,
      },
    ],
    metadata: commonMetadata,
    success_url: successUrl.toString(),
    cancel_url: cancelUrl.toString(),
    allow_promotion_codes: true,
  };

  const invoiceFooterText =
    resolved.slug === 'market-lens' || resolved.slug === 'trading-starter'
      ? "Il cliente ha richiesto l'accesso immediato al contenuto digitale e ha riconosciuto che, con l'inizio della fornitura, perde il diritto di recesso nei casi previsti dalla legge."
      : undefined;

  const checkoutSession = isSubscription
    ? await stripe.checkout.sessions.create({
        ...commonParams,
        mode: 'subscription',
        billing_address_collection: 'auto',
        automatic_tax: { enabled: true },
        subscription_data: {
          metadata: {
            product_slug: resolved.slug,
            user_email: userEmail,
            ...(consentTermsVersion && consentAcceptedAt
              ? {
                  consent_terms_v: consentTermsVersion,
                  consent_at: consentAcceptedAt.toISOString(),
                }
              : {}),
          },
        },
      })
    : await stripe.checkout.sessions.create({
        ...commonParams,
        mode: 'payment',
        submit_type: 'pay',
        billing_address_collection: 'auto',
        invoice_creation: {
          enabled: true,
          ...(invoiceFooterText
            ? {
                invoice_data: {
                  footer: invoiceFooterText,
                },
              }
            : {}),
        },
        automatic_tax: { enabled: true },
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

  if (!isSubscription) {
    try {
      await createPendingPurchase(
        userEmail,
        resolved.slug,
        checkoutSession.id,
        typeof checkoutSession.amount_total === 'number' ? checkoutSession.amount_total : 0,
        checkoutSession.currency || 'EUR',
        resolved.slug === 'market-lens' || resolved.slug === 'trading-starter'
          ? {
              consentTermsVersion,
              consentDigitalWithdrawalVersion,
              consentAcceptedAt,
            }
          : undefined,
      );
    } catch (err) {
      const safe = buildSafeStripeError(err);
      console.error('[stripe:checkout] Failed to persist pending purchase', safe);
    }
  } else {
    console.info('[stripe:checkout] subscription checkout session created', {
      sessionId: checkoutSession.id,
      userEmail,
      productSlug: resolved.slug,
    });
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

    let slug: string | null = null;
    try {
      const cloned = req.clone();
      const ct = (cloned.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('application/json')) {
        const payload = (await cloned.json()) as CheckoutPayload;
        if (typeof payload.slug === 'string') slug = resolveProduct(payload.slug)?.slug ?? null;
      } else if (ct.includes('form-urlencoded') || ct.includes('multipart/form-data')) {
        const fd = await cloned.formData();
        const s = fd.get('slug');
        if (typeof s === 'string') slug = resolveProduct(s)?.slug ?? null;
      } else {
        const payload = (await cloned.json()) as CheckoutPayload;
        if (typeof payload.slug === 'string') slug = resolveProduct(payload.slug)?.slug ?? null;
      }
    } catch {
      slug = null;
    }

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
