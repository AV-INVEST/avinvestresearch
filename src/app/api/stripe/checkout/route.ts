import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe/client';
import { resolveProduct } from '@/lib/stripe/pricing';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { siteConfig } from '@/config/siteConfig';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

interface CheckoutPayload {
  slug?: unknown;
}

function resolveBaseUrl(req: Request): string {
  const fromPublic = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromPublic && typeof fromPublic === 'string' && fromPublic.length > 0) {
    return fromPublic.replace(/\/+$/, '');
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
  return siteConfig.url.replace(/\/+$/, '');
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

export async function POST(req: Request): Promise<Response> {
  try {
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

    let stripe;
    try {
      stripe = getStripeClient();
    } catch (err) {
      const safeErr = buildSafeStripeError(err);
      console.error('[stripe:checkout] Stripe client init failed', safeErr);
      const message = err instanceof Error ? err.message : 'Stripe non configurato';
      return NextResponse.json({ error: message }, { status: 503 });
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
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      payment_intent_data: {
        metadata: {
          product_slug: resolved.slug,
          user_email: userEmail,
        },
      },
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

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
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
