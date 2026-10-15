import type Stripe from 'stripe';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe/client';
import { resolveProduct } from '@/lib/stripe/pricing';
import {
  evaluateEvidence,
  mirrorConsentFromMetadata,
  type EvidenceFacts,
  type EvidenceKind,
  type EvidenceVerdict,
  type MirroredConsent,
} from '@/lib/admin/manual-grant-evidence';

export type StripeEvidenceKind = Exclude<EvidenceKind, 'OFF_PLATFORM'>;

export interface StripeEvidenceIds {
  checkoutSessionId?: string;
  paymentIntentId?: string;
  invoiceId?: string;
  chargeId?: string;
}

export interface StripeEvidenceResult {
  ok: boolean;
  error?: string;
  verdict?: EvidenceVerdict;
  facts?: EvidenceFacts;
  snapshot?: Record<string, unknown>;
  consent?: MirroredConsent;
  /** Chiave canonica dell'evidenza: PI se disponibile, altrimenti tipo:riferimento. */
  canonicalKeyBase?: string;
  ids?: StripeEvidenceIds;
}

const EMPTY_CONSENT: MirroredConsent = {
  source: 'NONE',
  termsVersion: null,
  digitalWithdrawalVersion: null,
  acceptedAt: null,
};

function isoFromUnix(value: unknown): string | null {
  return typeof value === 'number' && Number.isFinite(value)
    ? new Date(value * 1000).toISOString()
    : null;
}

function toMetadata(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === 'string') out[key] = value;
    }
  }
  return out;
}

/** latest_charge / charge possono essere id oppure oggetto espanso, a seconda della versione API. */
async function resolveCharge(
  stripe: Stripe,
  paymentIntent: unknown,
): Promise<{ charge: Record<string, unknown> | null; warning: string | null }> {
  if (!paymentIntent || typeof paymentIntent !== 'object') {
    return { charge: null, warning: 'payment_intent assente' };
  }
  const pi = paymentIntent as Record<string, unknown>;
  const candidate = pi.latest_charge ?? pi.charge;
  if (!candidate) return { charge: null, warning: 'charge assente' };
  if (typeof candidate === 'object') {
    return { charge: candidate as Record<string, unknown>, warning: null };
  }
  if (typeof candidate !== 'string' || candidate.length === 0) {
    return { charge: null, warning: 'charge non interpretabile' };
  }
  try {
    const retrieved = await stripe.charges.retrieve(candidate);
    return { charge: retrieved as unknown as Record<string, unknown>, warning: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'errore sconosciuto';
    return { charge: null, warning: `charge non recuperabile (${message})` };
  }
}

interface ChargeFlags {
  refundedAmount: number | null;
  disputed: boolean | null;
  chargeId: string | null;
}

function readChargeFlags(charge: Record<string, unknown> | null, warning: string | null): ChargeFlags {
  if (!charge) {
    return { refundedAmount: null, disputed: null, chargeId: null };
  }
  const chargeId = typeof charge.id === 'string' ? charge.id : null;
  const amountRefunded = typeof charge.amount_refunded === 'number' ? charge.amount_refunded : 0;
  const fullyRefunded = charge.refunded === true;
  const refundedAmount = fullyRefunded && amountRefunded === 0 ? Number.POSITIVE_INFINITY : amountRefunded;
  const disputed = typeof charge.disputed === 'boolean' ? charge.disputed : null;
  if (warning) {
    return { refundedAmount: null, disputed, chargeId };
  }
  return {
    refundedAmount: Number.isFinite(refundedAmount) ? refundedAmount : null,
    disputed,
    chargeId,
  };
}

/** Chiave canonica: se il pagamento ha un PaymentIntent, sessione e PI collassano sulla stessa chiave. */
export function canonicalEvidenceKey(
  kind: EvidenceKind,
  reference: string,
  paymentIntentId?: string | null,
): string {
  if (paymentIntentId && paymentIntentId.trim().length > 0) {
    return `PI:${paymentIntentId.trim()}`;
  }
  return `${kind}:${reference.trim()}`;
}

export async function verifyStripeEvidence(params: {
  kind: StripeEvidenceKind;
  reference: string;
  expectedSlug: string;
}): Promise<StripeEvidenceResult> {
  const reference = (params.reference ?? '').trim();
  if (reference.length === 0) {
    return { ok: false, error: 'Inserisci il riferimento del pagamento (ID Stripe).' };
  }
  if (!isStripeConfigured()) {
    return {
      ok: false,
      error: 'Stripe non configurato: impossibile verificare il pagamento in questo ambiente.',
    };
  }
  const product = resolveProduct(params.expectedSlug);
  if (!product || product.billingMode !== 'one_time') {
    return { ok: false, error: 'Prodotto non valido per un accesso manuale.' };
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Stripe non configurato.',
    };
  }

  let facts: EvidenceFacts;
  let snapshot: Record<string, unknown>;
  let ids: StripeEvidenceIds;
  let consent: MirroredConsent = EMPTY_CONSENT;
  let expectedPriceId: string | null = null;

  try {
    if (params.kind === 'STRIPE_CHECKOUT_SESSION') {
      const session = await stripe.checkout.sessions.retrieve(reference, {
        expand: ['payment_intent', 'line_items'],
      });
      const record = session as unknown as Record<string, unknown>;
      const metadata = toMetadata(record.metadata);
      const { charge, warning } = await resolveCharge(stripe, record.payment_intent);
      const flags = readChargeFlags(charge, warning);
      const lineItems = record.line_items as { data?: Array<Record<string, unknown>> } | undefined;
      const firstPrice = lineItems?.data?.[0]?.price as Record<string, unknown> | undefined;
      const paymentIntentId =
        typeof record.payment_intent === 'object' && record.payment_intent
          ? String((record.payment_intent as Record<string, unknown>).id ?? '')
          : typeof record.payment_intent === 'string'
            ? record.payment_intent
            : '';

      facts = {
        reference: session.id,
        status: typeof record.payment_status === 'string' ? record.payment_status : null,
        amountPaid: typeof record.amount_total === 'number' ? record.amount_total : null,
        currency: typeof record.currency === 'string' ? record.currency : null,
        paidAt: isoFromUnix(record.created),
        customerEmail:
          (session.customer_details?.email ?? session.customer_email ?? null) || null,
        priceId: typeof firstPrice?.id === 'string' ? firstPrice.id : null,
        metadata,
        refundedAmount: flags.refundedAmount,
        disputed: flags.disputed,
        chargeId: flags.chargeId,
      };
      expectedPriceId = product.priceId;
      consent = mirrorConsentFromMetadata(metadata);
      ids = {
        checkoutSessionId: session.id,
        paymentIntentId: paymentIntentId || undefined,
        chargeId: flags.chargeId ?? undefined,
      };
      snapshot = {
        type: 'checkout.session',
        id: session.id,
        payment_status: record.payment_status,
        amount_total: record.amount_total,
        currency: record.currency,
        created: record.created,
        customer_email: facts.customerEmail,
        payment_intent: paymentIntentId || null,
        charge: flags.chargeId,
        amount_refunded: flags.refundedAmount,
        disputed: flags.disputed,
        metadata: pickMetadata(metadata),
      };
    } else if (params.kind === 'STRIPE_PAYMENT_INTENT') {
      const paymentIntent = await stripe.paymentIntents.retrieve(reference, {
        expand: ['latest_charge'],
      });
      const record = paymentIntent as unknown as Record<string, unknown>;
      const metadata = toMetadata(record.metadata);
      const { charge, warning } = await resolveCharge(stripe, record);
      const flags = readChargeFlags(charge, warning);
      facts = {
        reference: paymentIntent.id,
        status: typeof record.status === 'string' ? record.status : null,
        amountPaid:
          typeof record.amount_received === 'number'
            ? record.amount_received
            : typeof record.amount === 'number'
              ? record.amount
              : null,
        currency: typeof record.currency === 'string' ? record.currency : null,
        paidAt: isoFromUnix(record.created),
        customerEmail:
          typeof record.receipt_email === 'string' ? record.receipt_email : null,
        priceId: null,
        metadata,
        refundedAmount: flags.refundedAmount,
        disputed: flags.disputed,
        chargeId: flags.chargeId,
      };
      consent = mirrorConsentFromMetadata(metadata);
      ids = { paymentIntentId: paymentIntent.id, chargeId: flags.chargeId ?? undefined };
      snapshot = {
        type: 'payment_intent',
        id: paymentIntent.id,
        status: record.status,
        amount_received: record.amount_received,
        currency: record.currency,
        created: record.created,
        receipt_email: facts.customerEmail,
        charge: flags.chargeId,
        amount_refunded: flags.refundedAmount,
        disputed: flags.disputed,
        metadata: pickMetadata(metadata),
      };
    } else {
      const invoice = await stripe.invoices.retrieve(reference, {
        expand: ['payment_intent'],
      });
      const record = invoice as unknown as Record<string, unknown>;
      const metadata = toMetadata(record.metadata);
      const { charge, warning } = await resolveCharge(stripe, record.payment_intent);
      const flags = readChargeFlags(charge, warning);
      const paymentIntentId =
        typeof record.payment_intent === 'object' && record.payment_intent
          ? String((record.payment_intent as Record<string, unknown>).id ?? '')
          : typeof record.payment_intent === 'string'
            ? record.payment_intent
            : '';
      facts = {
        reference: invoice.id ?? reference,
        status: typeof record.status === 'string' ? record.status : null,
        amountPaid:
          typeof record.amount_paid === 'number'
            ? record.amount_paid
            : typeof record.amount_due === 'number'
              ? record.amount_due
              : null,
        currency: typeof record.currency === 'string' ? record.currency : null,
        paidAt: isoFromUnix(record.status_transitions && typeof record.status_transitions === 'object'
          ? (record.status_transitions as Record<string, unknown>).paid_at
          : null),
        customerEmail:
          (typeof record.customer_email === 'string' ? record.customer_email : null) || null,
        priceId: null,
        metadata,
        refundedAmount: flags.refundedAmount,
        disputed: flags.disputed,
        chargeId: flags.chargeId,
      };
      consent = mirrorConsentFromMetadata(metadata);
      ids = {
        invoiceId: invoice.id ?? undefined,
        paymentIntentId: paymentIntentId || undefined,
        chargeId: flags.chargeId ?? undefined,
      };
      snapshot = {
        type: 'invoice',
        id: invoice.id,
        status: record.status,
        amount_paid: record.amount_paid,
        currency: record.currency,
        customer_email: facts.customerEmail,
        payment_intent: paymentIntentId || null,
        charge: flags.chargeId,
        amount_refunded: flags.refundedAmount,
        disputed: flags.disputed,
        metadata: pickMetadata(metadata),
      };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'errore sconosciuto';
    return {
      ok: false,
      error: `Verifica su Stripe non riuscita per il riferimento indicato (${message}).`,
    };
  }

  const verdict = evaluateEvidence({
    kind: params.kind,
    facts,
    expectedSlug: params.expectedSlug,
    expectedAmountInCents: product.amountInCents,
    expectedCurrency: product.currency,
    expectedPriceId,
  });

  const paymentIntentId = ids.paymentIntentId ?? null;

  return {
    ok: verdict.ok,
    verdict,
    facts,
    snapshot,
    consent,
    ids,
    canonicalKeyBase: canonicalEvidenceKey(params.kind, facts.reference, paymentIntentId),
  };
}

function pickMetadata(metadata: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (key === 'consent_terms_v' || key === 'consent_digital_withdrawal_v' || key === 'consent_at' || key === 'product_slug' || key === 'user_email' || key === 'billing_mode') {
      out[key] = value;
    }
  }
  return out;
}
