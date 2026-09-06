import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe/client';
import { resolveProduct } from '@/lib/stripe/pricing';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { getSiteUrl } from '@/lib/stripe/site-url';

export const dynamic = 'force-dynamic';

interface CheckoutPayload {
  slug?: unknown;
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
      const message = err instanceof Error ? err.message : 'Stripe non configurato';
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const siteUrl = getSiteUrl();
    const successUrl = new URL('/area-membri', siteUrl);
    successUrl.searchParams.set('checkout', 'success');
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');

    const cancelUrl = new URL('/#percorsi', siteUrl);
    cancelUrl.searchParams.set('checkout', 'cancelled');

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail,
      submit_type: 'pay',
      billing_address_collection: 'auto',
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: resolved.title + ' - Pagamento unico - IVA inclusa',
          metadata: {
            product_slug: resolved.slug,
            user_email: userEmail,
          },
        },
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
    const message =
      err instanceof Error && process.env.NODE_ENV === 'development'
        ? err.message
        : 'Si e verificato un errore durante la preparazione del pagamento.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
