import type Stripe from 'stripe';
import type { LiveEventTicketStatus } from '@prisma/client';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { ensureUser } from '@/lib/stripe/purchase-sync';

/**
 * Sincronizzazione dei biglietti degli Eventi Live Premium.
 *
 * Completamente separata da `purchase-sync.ts` (prodotti, abbonamenti,
 * licenze): gli eventi usano la tabella `LiveEventTicket` e la chiave
 * logica `userEmail + eventId`. Il webhook instrada qui solo le sessioni
 * Stripe che portano il metadata `live_event_id`.
 */

export const LIVE_EVENT_METADATA_KEY = 'live_event_id';

/** Estrae l'id dell'evento dal metadata della sessione, se presente. */
export function sessionLiveEventId(session: Stripe.Checkout.Session): string | null {
  const raw = session.metadata?.[LIVE_EVENT_METADATA_KEY];
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

function parseConsentDate(raw: string | undefined): Date | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  const t = new Date(raw);
  return Number.isNaN(t.getTime()) ? null : t;
}

export interface SyncLiveEventTicketInput {
  eventId: string;
  userEmail: string | null | undefined;
  checkoutSessionId: string;
  customerId?: string | null;
  paymentIntentId?: string | null;
  amountTotal: number;
  currency: string;
  status: LiveEventTicketStatus;
  purchasedAt?: Date | null;
  refundedAt?: Date | null;
  refundedAmount?: number | null;
  consentTermsVersion?: string | null;
  consentDigitalWithdrawalVersion?: string | null;
  consentAcceptedAt?: Date | null;
}

/**
 * Crea o aggiorna il biglietto per la coppia `userEmail + eventId`.
 * Un biglietto già `succeeded` non viene mai declassato o sovrascritto.
 */
export async function syncLiveEventTicket(input: SyncLiveEventTicketInput): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL non configurata: impossibile sincronizzare il biglietto.');
  }
  const email = normalizeEmail(input.userEmail);
  if (!email) {
    throw new Error('Impossibile sincronizzare il biglietto: email mancante o non valida.');
  }

  const event = await prisma.liveEvent.findUnique({
    where: { id: input.eventId },
    select: { id: true },
  });
  if (!event) {
    console.warn('[stripe:live-event] evento non trovato per il biglietto', input.eventId);
    return;
  }

  await ensureUser(email);

  const existing = await prisma.liveEventTicket.findUnique({
    where: { userEmail_eventId: { userEmail: email, eventId: input.eventId } },
    select: { status: true },
  });
  if (existing?.status === 'succeeded' && input.status !== 'succeeded') {
    // Non declassare un biglietto già valido (es. eventi Stripe fuori ordine).
    return;
  }

  const data = {
    checkoutSessionId: input.checkoutSessionId,
    customerId: input.customerId ?? undefined,
    paymentIntentId: input.paymentIntentId ?? undefined,
    amountTotal: input.amountTotal,
    currency: String(input.currency || 'EUR').toUpperCase(),
    status: input.status,
    purchasedAt: input.purchasedAt ?? undefined,
    refundedAt: input.refundedAt ?? undefined,
    refundedAmount: input.refundedAmount ?? undefined,
    consentTermsVersion: input.consentTermsVersion ?? undefined,
    consentDigitalWithdrawalVersion: input.consentDigitalWithdrawalVersion ?? undefined,
    consentAcceptedAt: input.consentAcceptedAt ?? undefined,
  };

  try {
    await prisma.liveEventTicket.upsert({
      where: { userEmail_eventId: { userEmail: email, eventId: input.eventId } },
      create: { eventId: input.eventId, userEmail: email, ...data },
      update: data,
    });
  } catch (err) {
    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : null;
    if (code === 'P2002') {
      console.warn('[stripe:live-event] collisione univoca sul biglietto, ignorata', {
        eventId: input.eventId,
        checkoutSessionId: input.checkoutSessionId,
      });
      return;
    }
    throw err;
  }
}

/**
 * Salva/aggiorna il biglietto in stato `pending` al momento dell'avvio del
 * checkout. Riusa la riga esistente per la coppia `userEmail + eventId`
 * (nuovo tentativo dopo un checkout abbandonato), sostituendo la sessione.
 */
export async function upsertPendingLiveEventTicket(input: {
  eventId: string;
  userEmail: string;
  checkoutSessionId: string;
  amountTotal: number;
  currency: string;
  consentTermsVersion?: string | null;
  consentAcceptedAt?: Date | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const email = normalizeEmail(input.userEmail);
  if (!email) return;

  const existing = await prisma.liveEventTicket.findUnique({
    where: { userEmail_eventId: { userEmail: email, eventId: input.eventId } },
    select: { status: true },
  });
  if (existing?.status === 'succeeded') {
    // Biglietto già valido: non deve essere sovrascritto.
    return;
  }

  const data = {
    checkoutSessionId: input.checkoutSessionId,
    amountTotal: input.amountTotal,
    currency: String(input.currency || 'EUR').toUpperCase(),
    status: 'pending' as LiveEventTicketStatus,
    consentTermsVersion: input.consentTermsVersion ?? undefined,
    consentAcceptedAt: input.consentAcceptedAt ?? undefined,
  };

  try {
    await prisma.liveEventTicket.upsert({
      where: { userEmail_eventId: { userEmail: email, eventId: input.eventId } },
      create: { eventId: input.eventId, userEmail: email, ...data },
      update: data,
    });
  } catch (err) {
    const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : null;
    if (code !== 'P2002') throw err;
  }
}

/** Sincronizza il biglietto a partire da una sessione Stripe di checkout. */
export async function syncLiveEventTicketFromSession(
  session: Stripe.Checkout.Session,
  forcedStatus?: LiveEventTicketStatus,
): Promise<void> {
  const eventId = sessionLiveEventId(session);
  if (!eventId) return;

  const email =
    normalizeEmail(session.metadata?.user_email) ?? normalizeEmail(session.customer_email);
  const paymentStatus = session.payment_status;
  const status: LiveEventTicketStatus =
    forcedStatus ??
    (paymentStatus === 'paid' || paymentStatus === 'no_payment_required' ? 'succeeded' : 'pending');

  const customerId =
    typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null;
  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  const meta = session.metadata ?? {};

  await syncLiveEventTicket({
    eventId,
    userEmail: email,
    checkoutSessionId: session.id,
    customerId,
    paymentIntentId,
    amountTotal: session.amount_total ?? 0,
    currency: String(session.currency || 'EUR').toUpperCase(),
    status,
    purchasedAt: status === 'succeeded' ? new Date() : null,
    consentTermsVersion:
      typeof meta.consent_terms_v === 'string' && meta.consent_terms_v.length > 0
        ? meta.consent_terms_v
        : null,
    consentDigitalWithdrawalVersion:
      typeof meta.consent_digital_withdrawal_v === 'string' &&
      meta.consent_digital_withdrawal_v.length > 0
        ? meta.consent_digital_withdrawal_v
        : null,
    consentAcceptedAt: parseConsentDate(meta.consent_at),
  });
}

/** Marca come `failed` un biglietto `pending` la cui sessione è scaduta/fallita. */
export async function markLiveEventTicketFailed(checkoutSessionId: string): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.liveEventTicket.updateMany({
      where: { checkoutSessionId, status: 'pending' },
      data: { status: 'failed' },
    });
  } catch (err) {
    console.warn('[stripe:live-event] aggiornamento biglietto a failed non riuscito', err);
  }
}

/** Applica un rimborso (totale o parziale) al biglietto collegato al PaymentIntent. */
export async function applyLiveEventChargeRefund(charge: Stripe.Charge): Promise<void> {
  if (!isDatabaseConfigured()) return;
  const paymentIntent =
    typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
  if (!paymentIntent) return;

  const ticket = await prisma.liveEventTicket.findFirst({
    where: { paymentIntentId: paymentIntent },
    orderBy: { createdAt: 'desc' },
  });
  if (!ticket) return;

  const amountRefunded = charge.amount_refunded ?? 0;
  const amountTotal = charge.amount ?? ticket.amountTotal;
  const isFull = amountRefunded + 1 >= amountTotal;
  const now = new Date();

  await prisma.liveEventTicket.update({
    where: { id: ticket.id },
    data: {
      refundedAmount: Math.max(ticket.refundedAmount ?? 0, amountRefunded),
      refundedAt: isFull ? now : ticket.refundedAt,
      status: isFull ? 'refunded' : ticket.status,
    },
  });
}
