import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripeClient, getStripeWebhookSecret } from '@/lib/stripe/client';
import { markEventProcessed, metadataFromSession, syncPurchase, applyChargeRefund } from '@/lib/stripe/purchase-sync';
import {
  handleCheckoutSessionCompletedSubscription,
  handleSubscriptionUpsertFromStripe,
  handleSubscriptionDeletedFromStripe,
  handleInvoicePaid,
  handleInvoicePaymentFailed,
} from '@/lib/stripe/subscription-sync';
import type { PurchaseStatus } from '@prisma/client';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { isDatabaseConfigured } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

async function fetchInvoiceUrls(
  stripe: Stripe,
  invoiceId: string | Stripe.Invoice | null | undefined,
): Promise<{ hosted: string | null; pdf: string | null; invoiceId: string | null }> {
  if (!invoiceId) return { hosted: null, pdf: null, invoiceId: null };
  if (typeof invoiceId !== 'string') {
    return {
      hosted: invoiceId.hosted_invoice_url ?? null,
      pdf: invoiceId.invoice_pdf ?? null,
      invoiceId: invoiceId.id,
    };
  }
  try {
    const invoice = await stripe.invoices.retrieve(invoiceId);
    return {
      hosted: invoice.hosted_invoice_url ?? null,
      pdf: invoice.invoice_pdf ?? null,
      invoiceId: invoice.id,
    };
  } catch {
    return { hosted: null, pdf: null, invoiceId };
  }
}

async function handleCheckoutSessionCompleted(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
  const meta = metadataFromSession(session);
  const billingModeRaw = session.metadata?.billing_mode;
  const isSubscription = session.mode === 'subscription' || billingModeRaw === 'subscription';
  if (isSubscription) {
    const result = await handleCheckoutSessionCompletedSubscription(stripe, session);
    if (result.handled) return;
  }
  const userEmail = meta.user_email ?? normalizeEmail(session.customer_email);
  const productSlug = meta.product_slug;
  const paymentStatus = session.payment_status;
  const status: PurchaseStatus = paymentStatus === 'paid' ? 'succeeded' : 'pending';
  const purchasedAt = status === 'succeeded' ? new Date() : null;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  const amountTotal = session.amount_total ?? 0;
  const currency = String(session.currency || 'EUR').toUpperCase();
  const invoiceInfo = await fetchInvoiceUrls(stripe, session.invoice as Stripe.Invoice | string | null | undefined);
  await syncPurchase({
    userEmail,
    productSlug,
    checkoutSessionId: session.id,
    customerId,
    paymentIntentId,
    invoiceId: invoiceInfo.invoiceId,
    amountTotal,
    currency,
    status,
    purchasedAt,
    invoiceHostedUrl: invoiceInfo.hosted,
    invoicePdfUrl: invoiceInfo.pdf,
  });
}

async function handleAsyncPaymentSucceeded(stripe: Stripe, session: Stripe.Checkout.Session): Promise<void> {
  const meta = metadataFromSession(session);
  const userEmail = meta.user_email ?? normalizeEmail(session.customer_email);
  const productSlug = meta.product_slug;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  const amountTotal = session.amount_total ?? 0;
  const currency = String(session.currency || 'EUR').toUpperCase();
  const invoiceInfo = await fetchInvoiceUrls(stripe, session.invoice as Stripe.Invoice | string | null | undefined);
  await syncPurchase({
    userEmail,
    productSlug,
    checkoutSessionId: session.id,
    customerId,
    paymentIntentId,
    invoiceId: invoiceInfo.invoiceId,
    amountTotal,
    currency,
    status: 'succeeded',
    purchasedAt: new Date(),
    invoiceHostedUrl: invoiceInfo.hosted,
    invoicePdfUrl: invoiceInfo.pdf,
  });
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session): Promise<void> {
  const meta = metadataFromSession(session);
  const userEmail = meta.user_email ?? normalizeEmail(session.customer_email);
  const productSlug = meta.product_slug;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null;
  const amountTotal = session.amount_total ?? 0;
  const currency = String(session.currency || 'EUR').toUpperCase();
  await syncPurchase({
    userEmail,
    productSlug,
    checkoutSessionId: session.id,
    customerId,
    paymentIntentId,
    amountTotal,
    currency,
    status: 'failed',
  });
}

export async function POST(req: Request): Promise<Response> {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'Webhook rifiutato: database non configurato (DATABASE_URL mancante).' },
      { status: 503 },
    );
  }

  let stripe: Stripe;
  let webhookSecret: string;
  try {
    stripe = getStripeClient();
    webhookSecret = getStripeWebhookSecret();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe non configurato';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  const signature = req.headers.get('stripe-signature') ?? '';
  if (signature.length === 0) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook Error';
    return NextResponse.json(
      { error: `Webhook Error: ${message.replace(/sk_[A-Za-z0-9]+/g, '[REDACTED]')}` },
      { status: 400 },
    );
  }

  const idempotency = await markEventProcessed(event.id, event.type).catch((err) => {
    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : null;
    if (code === 'P2002') return { duplicate: true };
    throw err;
  });
  if (idempotency.duplicate) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(stripe, session);
        break;
      }
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleAsyncPaymentSucceeded(stripe, session);
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleAsyncPaymentFailed(session);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await applyChargeRefund(charge);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpsertFromStripe(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletedFromStripe(sub);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown processing error';
    console.error('[stripe:webhook] Processing failed for event', event.id, '-', message);
    return NextResponse.json(
      { error: 'Internal processing error', eventId: event.id },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true, eventId: event.id });
}
