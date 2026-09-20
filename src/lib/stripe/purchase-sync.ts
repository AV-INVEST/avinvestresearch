import type Stripe from 'stripe';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import type { PurchaseStatus } from '@prisma/client';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { isKnownProductSlug, type ResolvedProduct } from '@/lib/stripe/pricing';

export interface SyncPurchaseInput {
  userEmail: string | null | undefined;
  productSlug: string | null | undefined;
  checkoutSessionId: string;
  customerId?: string | null;
  paymentIntentId?: string | null;
  invoiceId?: string | null;
  amountTotal: number;
  currency: string;
  status: PurchaseStatus;
  purchasedAt?: Date | null;
  refundedAt?: Date | null;
  refundedAmount?: number | null;
  invoiceHostedUrl?: string | null;
  invoicePdfUrl?: string | null;
  consentTermsVersion?: string | null;
  consentDigitalWithdrawalVersion?: string | null;
  consentAcceptedAt?: Date | null;
}

function requireDb(): void {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL non configurata. Imposta la variabile prima di elaborare il webhook.');
  }
}

export async function ensureUser(emailRaw: string | null | undefined, opts?: { name?: string | null; image?: string | null; googleId?: string | null }): Promise<string | null> {
  requireDb();
  const email = normalizeEmail(emailRaw);
  if (!email) return null;
  const user = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: opts?.name ?? undefined,
      image: opts?.image ?? undefined,
      googleId: opts?.googleId ?? undefined,
    },
    update: {
      name: opts?.name ?? undefined,
      image: opts?.image ?? undefined,
      googleId: opts?.googleId ?? undefined,
    },
    select: { email: true },
  });
  return user.email;
}

export async function syncPurchase(input: SyncPurchaseInput): Promise<void> {
  requireDb();
  const email = normalizeEmail(input.userEmail);
  if (!email) {
    throw new Error('Impossibile sincronizzare lacquisto: email mancante o non valida.');
  }
  const slug = isKnownProductSlug(input.productSlug) ? input.productSlug : null;
  if (!slug) {
    throw new Error('Product slug non riconosciuto durante syncPurchase.');
  }
  await ensureUser(email);
  await prisma.purchase.upsert({
    where: { checkoutSessionId: input.checkoutSessionId },
    create: {
      userEmail: email,
      productSlug: slug,
      checkoutSessionId: input.checkoutSessionId,
      customerId: input.customerId ?? undefined,
      paymentIntentId: input.paymentIntentId ?? undefined,
      invoiceId: input.invoiceId ?? undefined,
      amountTotal: input.amountTotal,
      currency: String(input.currency || 'EUR').toUpperCase(),
      status: input.status,
      purchasedAt: input.purchasedAt ?? undefined,
      refundedAt: input.refundedAt ?? undefined,
      refundedAmount: input.refundedAmount ?? undefined,
      invoiceHostedUrl: input.invoiceHostedUrl ?? undefined,
      invoicePdfUrl: input.invoicePdfUrl ?? undefined,
      consentTermsVersion: input.consentTermsVersion ?? undefined,
      consentDigitalWithdrawalVersion: input.consentDigitalWithdrawalVersion ?? undefined,
      consentAcceptedAt: input.consentAcceptedAt ?? undefined,
    },
    update: {
      customerId: input.customerId ?? undefined,
      paymentIntentId: input.paymentIntentId ?? undefined,
      invoiceId: input.invoiceId ?? undefined,
      amountTotal: input.amountTotal,
      currency: String(input.currency || 'EUR').toUpperCase(),
      status: input.status,
      purchasedAt: input.purchasedAt ?? undefined,
      refundedAt: input.refundedAt ?? undefined,
      refundedAmount: input.refundedAmount ?? undefined,
      invoiceHostedUrl: input.invoiceHostedUrl ?? undefined,
      invoicePdfUrl: input.invoicePdfUrl ?? undefined,
      consentTermsVersion: input.consentTermsVersion ?? undefined,
      consentDigitalWithdrawalVersion: input.consentDigitalWithdrawalVersion ?? undefined,
      consentAcceptedAt: input.consentAcceptedAt ?? undefined,
    },
  });
}

export interface ConsentFromSession {
  consentTermsVersion: string | null;
  consentDigitalWithdrawalVersion: string | null;
  consentAcceptedAt: Date | null;
}

export function metadataFromSession(session: Stripe.Checkout.Session): {
  user_email: string | null;
  product_slug: ResolvedProduct['slug'] | null;
} & ConsentFromSession {
  const raw = session.metadata ?? {};
  const consentTermsV = typeof raw.consent_terms_v === 'string' && raw.consent_terms_v.length > 0
    ? raw.consent_terms_v
    : null;
  const consentDigitalV = typeof raw.consent_digital_withdrawal_v === 'string' && raw.consent_digital_withdrawal_v.length > 0
    ? raw.consent_digital_withdrawal_v
    : null;
  let consentAt: Date | null = null;
  if (typeof raw.consent_at === 'string' && raw.consent_at.length > 0) {
    const t = new Date(raw.consent_at);
    if (!Number.isNaN(t.getTime())) consentAt = t;
  }
  return {
    user_email: typeof raw.user_email === 'string' ? normalizeEmail(raw.user_email) : normalizeEmail(session.customer_email),
    product_slug: isKnownProductSlug(raw.product_slug) ? raw.product_slug : null,
    consentTermsVersion: consentTermsV,
    consentDigitalWithdrawalVersion: consentDigitalV,
    consentAcceptedAt: consentAt,
  };
}

export async function markEventProcessed(eventId: string, eventType: string): Promise<{ duplicate: boolean }> {
  requireDb();
  try {
    await prisma.stripeEvent.create({
      data: {
        eventId,
        type: eventType,
      },
      select: { id: true },
    });
    return { duplicate: false };
  } catch (err) {
    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : null;
    if (code === 'P2002') {
      return { duplicate: true };
    }
    throw err;
  }
}

export async function applyChargeRefund(charge: Stripe.Charge): Promise<void> {
  requireDb();
  const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return;
  const purchase = await prisma.purchase.findFirst({
    where: { paymentIntentId: paymentIntent },
    orderBy: { createdAt: 'desc' },
  });
  if (!purchase) return;
  const amountRefunded = charge.amount_refunded ?? 0;
  const amountTotal = charge.amount ?? purchase.amountTotal;
  const tolerance = 1;
  const isFull = amountRefunded + tolerance >= amountTotal;
  const now = new Date();
  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      refundedAmount: Math.max(purchase.refundedAmount ?? 0, amountRefunded),
      refundedAt: isFull ? now : purchase.refundedAt,
      status: isFull ? 'refunded' : purchase.status,
    },
  });
}
