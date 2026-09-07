import { getStripeClient, isStripeConfigured } from '@/lib/stripe/client';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import Stripe from 'stripe';

export interface SubscriptionBillingRow {
  kind: 'subscription';
  id: string;
  title: string;
  product: 'AV_RESEARCH_CLUB' | string;
  date: Date;
  amountTotal: number;
  currency: string;
  status:
    | 'paid'
    | 'open'
    | 'draft'
    | 'uncollectible'
    | 'void'
    | 'payment_pending';
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  stripeSubscriptionId: string | null;
  stripeInvoiceId: string;
  periodStart: Date | null;
  periodEnd: Date | null;
}

export interface PurchaseBillingRow {
  kind: 'purchase';
  id: string;
  title: string;
  productSlug: string;
  date: Date;
  amountTotal: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'refunded' | 'failed';
  hostedInvoiceUrl: string | null;
  invoicePdfUrl: string | null;
  refundedAt: Date | null;
  refundedAmount: number | null;
}

export type BillingRow = SubscriptionBillingRow | PurchaseBillingRow;

function mapInvoiceStatus(
  invStatus: Stripe.Invoice['status'],
): SubscriptionBillingRow['status'] {
  switch (invStatus) {
    case 'paid':
      return 'paid';
    case 'open':
      return 'open';
    case 'draft':
      return 'draft';
    case 'uncollectible':
      return 'uncollectible';
    case 'void':
      return 'void';
    default:
      return 'payment_pending';
  }
}

export async function loadSubscriptionInvoiceRows(
  userEmailRaw: string | null | undefined,
): Promise<SubscriptionBillingRow[]> {
  if (!isDatabaseConfigured() || !isStripeConfigured()) return [];
  const userEmail = normalizeEmail(userEmailRaw);
  if (!userEmail) return [];

  let stripe: Stripe | null = null;
  try {
    stripe = getStripeClient();
  } catch {
    return [];
  }

  try {
    const sub = await prisma.subscription.findFirst({
      where: {
        userEmail,
        product: 'AV_RESEARCH_CLUB',
      },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        latestInvoicePaidAt: true,
        status: true,
        currentPeriodEnd: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!sub || !sub.stripeCustomerId) {
      return [];
    }

    let invoices: Stripe.Invoice[] = [];
    try {
      invoices = await stripe.invoices.list({
        customer: sub.stripeCustomerId,
        subscription: sub.stripeSubscriptionId ?? undefined,
        limit: 24,
        expand: ['data.subscription'],
      }).then((res) => res.data);
    } catch (err) {
      console.warn('[stripe:billing] invoices.list failed', {
        customerId: sub.stripeCustomerId,
        error: err instanceof Error ? err.message : String(err),
      });
      invoices = [];
    }

    const rows: SubscriptionBillingRow[] = [];
    const seen = new Set<string>();

    for (const inv of invoices) {
      if (!inv.id || seen.has(inv.id)) continue;
      seen.add(inv.id);
      const amountTotal = typeof inv.amount_paid === 'number'
        ? inv.amount_paid
        : typeof inv.total === 'number'
          ? inv.total
          : 0;
      const currency = inv.currency ? inv.currency.toUpperCase() : 'EUR';
      const status = mapInvoiceStatus(inv.status);
      const periodStart = inv.period_start ? new Date(inv.period_start * 1000) : null;
      const periodEnd = inv.period_end ? new Date(inv.period_end * 1000) : null;
      const paidDate = inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000)
        : inv.created
          ? new Date(inv.created * 1000)
          : new Date();
      const title = 'AV Research Club';

      rows.push({
        kind: 'subscription',
        id: `sub-invoice:${inv.id}`,
        title,
        product: 'AV_RESEARCH_CLUB',
        date: paidDate,
        amountTotal,
        currency,
        status,
        hostedInvoiceUrl: inv.hosted_invoice_url || null,
        invoicePdfUrl: inv.invoice_pdf || null,
        stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
        stripeInvoiceId: inv.id,
        periodStart,
        periodEnd,
      });
    }

    rows.sort((a, b) => b.date.getTime() - a.date.getTime());
    return rows;
  } catch (err) {
    console.warn('[stripe:billing] loadSubscriptionInvoiceRows error', {
      userEmail,
      error: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

export async function loadBillingHistory(
  userEmailRaw: string | null | undefined,
  purchaseRows: PurchaseBillingRow[],
): Promise<BillingRow[]> {
  const subRows = await loadSubscriptionInvoiceRows(userEmailRaw);
  const merged: BillingRow[] = [...purchaseRows, ...subRows];
  merged.sort((a, b) => b.date.getTime() - a.date.getTime());
  return merged;
}
