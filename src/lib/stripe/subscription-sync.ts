import type Stripe from 'stripe';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import type { SubscriptionStatus, SubscriptionProduct } from '@prisma/client';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { isKnownProductSlug } from '@/lib/stripe/pricing';
import { ensureUser } from '@/lib/stripe/purchase-sync';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe/client';

function requireDb(): void {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL non configurata. Imposta la variabile prima di elaborare il webhook.');
  }
}

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'incomplete':
      return 'INCOMPLETE';
    case 'incomplete_expired':
      return 'ENDED';
    case 'trialing':
      return 'TRIALING';
    case 'active':
      return 'ACTIVE';
    case 'past_due':
      return 'PAST_DUE';
    case 'canceled':
      return 'CANCELED';
    case 'unpaid':
      return 'PAST_DUE';
    case 'paused':
      return 'CANCELED';
    default:
      return 'INCOMPLETE';
  }
}

export function resolveProductForSubscription(
  productSlugRaw: string | null | undefined,
  stripePriceId?: string | null,
): { product: SubscriptionProduct; slug: string | null } {
  if (isKnownProductSlug(productSlugRaw) && productSlugRaw === 'research-club') {
    return { product: 'AV_RESEARCH_CLUB', slug: productSlugRaw };
  }
  const envPrice = process.env.STRIPE_PRICE_AV_RESEARCH_CLUB;
  if (envPrice && stripePriceId && envPrice === stripePriceId) {
    return { product: 'AV_RESEARCH_CLUB', slug: 'research-club' };
  }
  if (productSlugRaw === 'research-club') {
    return { product: 'AV_RESEARCH_CLUB', slug: 'research-club' };
  }
  return { product: 'AV_RESEARCH_CLUB', slug: productSlugRaw ?? null };
}

function extractMetadata(
  meta: Record<string, string> | null | undefined,
  fallbackEmail?: string | null,
): { user_email: string | null; product_slug: string | null } {
  const raw = meta ?? {};
  const userEmail = typeof raw.user_email === 'string'
    ? normalizeEmail(raw.user_email)
    : normalizeEmail(fallbackEmail ?? null);
  const productSlug = typeof raw.product_slug === 'string' ? raw.product_slug : null;
  return { user_email: userEmail, product_slug: productSlug };
}

export interface UpsertSubscriptionInput {
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  userEmail: string;
  product: SubscriptionProduct;
  stripePriceId?: string | null;
  status: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: Date | null;
  latestInvoicePaidAt?: Date | null;
  paymentProblem?: boolean;
  paymentProblemAt?: Date | null;
}

export async function upsertSubscription(input: UpsertSubscriptionInput): Promise<void> {
  requireDb();
  const {
    stripeSubscriptionId,
    stripeCustomerId,
    userEmail,
    product,
    stripePriceId,
    status,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    latestInvoicePaidAt,
    paymentProblem,
    paymentProblemAt,
  } = input;
  if (!userEmail) throw new Error('userEmail required for subscription upsert');
  if (!stripeSubscriptionId) throw new Error('stripeSubscriptionId required for subscription upsert');
  await ensureUser(userEmail);

  const payloadCreate = {
    stripeSubscriptionId,
    stripeCustomerId,
    userEmail,
    product,
    stripePriceId: stripePriceId ?? undefined,
    status,
    cancelAtPeriodEnd,
    currentPeriodEnd: currentPeriodEnd ?? undefined,
    latestInvoicePaidAt: latestInvoicePaidAt ?? undefined,
    paymentProblem: paymentProblem ?? false,
    paymentProblemAt: paymentProblemAt ?? undefined,
  };

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId },
    create: payloadCreate,
    update: {
      stripeCustomerId,
      stripePriceId: stripePriceId ?? undefined,
      status,
      cancelAtPeriodEnd,
      currentPeriodEnd: currentPeriodEnd ?? undefined,
      latestInvoicePaidAt: latestInvoicePaidAt ?? undefined,
      paymentProblem: paymentProblem ?? undefined,
      paymentProblemAt: paymentProblemAt ?? undefined,
    },
  });
}

function extractSubscriptionPriceId(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0];
  const priceId = typeof item?.price === 'object' ? item.price.id : item?.price ?? null;
  return priceId ?? null;
}

export function extractCurrentPeriodEnd(sub: Stripe.Subscription): Date | null {
  const subAny = sub as any;
  const candidates: number[] = [];
  if (typeof subAny.cancel_at === 'number' && subAny.cancel_at > 0) {
    candidates.push(subAny.cancel_at);
  }
  if (Array.isArray(sub.items?.data)) {
    for (const item of sub.items.data) {
      const itemAny = item as any;
      const ts = itemAny.current_period_end ?? itemAny.current_periodEnd;
      if (typeof ts === 'number' && ts > 0) {
        candidates.push(ts);
      }
    }
  }
  const legacyTop = subAny.current_period_end ?? subAny.current_periodEnd;
  if (typeof legacyTop === 'number' && legacyTop > 0) {
    candidates.push(legacyTop);
  }
  if (candidates.length === 0) return null;
  const maxTs = Math.max(...candidates);
  return new Date(maxTs * 1000);
}

export function extractCurrentPeriodStart(sub: Stripe.Subscription): Date | null {
  const subAny = sub as any;
  const candidates: number[] = [];
  if (Array.isArray(sub.items?.data)) {
    for (const item of sub.items.data) {
      const itemAny = item as any;
      const ts = itemAny.current_period_start ?? itemAny.current_periodStart;
      if (typeof ts === 'number' && ts > 0) {
        candidates.push(ts);
      }
    }
  }
  const legacyTop = subAny.current_period_start ?? subAny.current_periodStart;
  if (typeof legacyTop === 'number' && legacyTop > 0) {
    candidates.push(legacyTop);
  }
  if (candidates.length === 0) return null;
  const minTs = Math.min(...candidates);
  return new Date(minTs * 1000);
}

export function isScheduledCancellation(sub: Stripe.Subscription): boolean {
  const subAny = sub as any;
  if (typeof subAny.cancel_at === 'number' && subAny.cancel_at > 0) {
    return true;
  }
  const itemFlags: boolean[] = [];
  if (Array.isArray(sub.items?.data)) {
    for (const item of sub.items.data) {
      const itemAny = item as any;
      const flag = itemAny.cancel_at_period_end;
      if (typeof flag === 'boolean') {
        itemFlags.push(flag);
      }
    }
  }
  const legacyTop = subAny.cancel_at_period_end;
  if (typeof legacyTop === 'boolean') {
    itemFlags.push(legacyTop);
  }
  if (itemFlags.length === 0) return false;
  return itemFlags.some((f) => f === true);
}

function extractEmailFromCustomer(
  customerObj: string | Stripe.Customer | Stripe.DeletedCustomer | null | undefined,
): string | null {
  if (!customerObj) return null;
  if (typeof customerObj === 'string') return null;
  if (typeof customerObj === 'object' && 'email' in customerObj && customerObj.email) {
    return normalizeEmail(customerObj.email);
  }
  return null;
}

export async function handleCheckoutSessionCompletedSubscription(
  _stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<{ handled: boolean; reason?: string }> {
  requireDb();
  const meta = extractMetadata(session.metadata, session.customer_email);
  const isSubscriptionMode = session.mode === 'subscription';
  const subscriptionObj = session.subscription;
  if (!isSubscriptionMode || !subscriptionObj) {
    return { handled: false, reason: 'not a subscription mode session' };
  }
  const productInfo = resolveProductForSubscription(meta.product_slug);
  const stripeSubscriptionId = typeof subscriptionObj === 'string' ? subscriptionObj : subscriptionObj.id;
  const stripeCustomerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id ?? null;
  if (!stripeCustomerId) {
    return { handled: false, reason: 'missing stripe customer id' };
  }
  const userEmail = meta.user_email
    ?? (stripeCustomerId && extractEmailFromCustomer(session.customer))
    ?? normalizeEmail(session.customer_email);
  if (!userEmail) {
    return { handled: false, reason: 'missing user email' };
  }
  if (!stripeSubscriptionId) {
    return { handled: false, reason: 'missing stripe subscription id' };
  }
  const firstItem = session.line_items?.data?.[0] ?? null;
  const priceField = firstItem?.price ?? null;
  const priceId = typeof priceField === 'object' && priceField ? priceField.id : priceField ?? null;
  const now = new Date();
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId },
    create: {
      stripeSubscriptionId,
      stripeCustomerId,
      userEmail,
      product: productInfo.product,
      stripePriceId: priceId ?? undefined,
      status: 'INCOMPLETE',
      cancelAtPeriodEnd: false,
    },
    update: {
      stripeCustomerId,
      stripePriceId: priceId ?? undefined,
      product: productInfo.product,
      userEmail,
    },
  });
  void now;
  return { handled: true };
}

export async function handleSubscriptionUpsertFromStripe(
  sub: Stripe.Subscription,
  opts?: { forcePaymentProblem?: boolean; clearPaymentProblem?: boolean },
): Promise<void> {
  requireDb();
  const meta = extractMetadata(sub.metadata);
  const productInfo = resolveProductForSubscription(meta.product_slug, extractSubscriptionPriceId(sub));
  const stripeCustomerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null;
  if (!stripeCustomerId) throw new Error('Missing customer id on subscription');
  let userEmail = meta.user_email;
  if (!userEmail) {
    if (typeof sub.customer !== 'string' && sub.customer && 'email' in sub.customer && sub.customer.email) {
      userEmail = normalizeEmail(sub.customer.email);
    }
  }
  if (!userEmail) {
    const existing = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId: sub.id },
      select: { userEmail: true },
    });
    if (!existing) {
      throw new Error(`Cannot resolve user email for subscription ${sub.id}`);
    }
    userEmail = existing.userEmail;
  }
  const priceId = extractSubscriptionPriceId(sub);
  const stripeStatus = mapStripeSubscriptionStatus(sub.status);
  const cancelAtPeriodEnd = isScheduledCancellation(sub);
  const currentPeriodEnd = extractCurrentPeriodEnd(sub);
  const hasPaymentProblem = opts?.forcePaymentProblem === true;
  const clearPaymentProblem = opts?.clearPaymentProblem === true;
  const paymentProblemAt = hasPaymentProblem
    ? new Date()
    : clearPaymentProblem
      ? null
      : undefined;
  const paymentProblem = hasPaymentProblem ? true : clearPaymentProblem ? false : undefined;
  await upsertSubscription({
    stripeSubscriptionId: sub.id,
    stripeCustomerId,
    userEmail,
    product: productInfo.product,
    stripePriceId: priceId,
    status: stripeStatus,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    paymentProblem,
    paymentProblemAt,
  });
}

export async function handleSubscriptionDeletedFromStripe(sub: Stripe.Subscription): Promise<void> {
  requireDb();
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: sub.id },
    select: { id: true, userEmail: true },
  });
  if (!existing) return;
  const subAny = sub as any;
  const endedAt = subAny.ended_at ? new Date(subAny.ended_at * 1000) : new Date();
  const currentPeriodEnd = extractCurrentPeriodEnd(sub) ?? endedAt;
  await prisma.subscription.update({
    where: { stripeSubscriptionId: sub.id },
    data: {
      status: 'ENDED',
      currentPeriodEnd,
      cancelAtPeriodEnd: true,
    },
  });
}

export async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  requireDb();
  const invoiceAny = invoice as any;
  const subRef = invoiceAny.subscription;
  if (!subRef) return;
  const stripeSubscriptionId = typeof subRef === 'string' ? subRef : subRef?.id ?? null;
  if (!stripeSubscriptionId) return;
  const paidAt = invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : new Date();
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    select: { id: true },
  });
  if (!existing) return;
  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      paymentProblem: false,
      paymentProblemAt: null,
      latestInvoicePaidAt: paidAt,
    },
  });
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  requireDb();
  const invoiceAny = invoice as any;
  const subRef = invoiceAny.subscription;
  if (!subRef) return;
  const stripeSubscriptionId = typeof subRef === 'string' ? subRef : subRef?.id ?? null;
  if (!stripeSubscriptionId) return;
  const existing = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId },
    select: { id: true },
  });
  if (!existing) return;
  await prisma.subscription.update({
    where: { stripeSubscriptionId },
    data: {
      paymentProblem: true,
      paymentProblemAt: new Date(),
    },
  });
}

export async function repairSubscriptionStateFromStripe(
  stripeSubscriptionId: string | null | undefined,
): Promise<void> {
  if (!stripeSubscriptionId || !isDatabaseConfigured() || !isStripeConfigured()) return;
  let stripe: Stripe | null = null;
  try {
    stripe = getStripeClient();
  } catch {
    return;
  }
  try {
    const liveSub = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['customer'],
    });
    await handleSubscriptionUpsertFromStripe(liveSub);
  } catch (err) {
    console.warn('[stripe:repair] subscriptions.retrieve failed during read-repair', {
      stripeSubscriptionId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
