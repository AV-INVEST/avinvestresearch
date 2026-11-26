import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe/client';
import { getLiveEventPriceId } from '@/lib/stripe/live-event-pricing';
import { upsertPendingLiveEventTicket } from '@/lib/stripe/live-event-sync';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { siteConfig } from '@/config/siteConfig';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

/**
 * Checkout dedicato ai biglietti degli Eventi Live Premium.
 *
 * Deliberatamente separato da `/api/stripe/checkout`: non modifica né
 * riusa la logica dei prodotti, degli abbonamenti o delle licenze. Ogni
 * biglietto è identificato lato server dalla coppia verificata
 * `userEmail + eventId`, letta dai dati di sessione e dal database.
 */

interface EventCheckoutPayload {
  eventId?: unknown;
  consentTermsVersion?: unknown;
  consentAcceptedAt?: unknown;
}

const CONSENT_VERSION_RE = /^v[0-9]+(\.[0-9]+)?$/;

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
  if (isProduction) return PRODUCTION_URL;

  const origin = req.headers.get('origin');
  if (origin && origin.startsWith('http')) return origin.replace(/\/+$/, '');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (host) {
    const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
    return `${proto}://${host}`.replace(/\/+$/, '');
  }
  return PRODUCTION_URL;
}

async function readPayload(req: Request): Promise<EventCheckoutPayload> {
  const contentType = (req.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const fd = await req.formData();
    const eventId = fd.get('eventId');
    const consentTermsVersion = fd.get('consentTermsVersion');
    const consentAcceptedAt = fd.get('consentAcceptedAt');
    return {
      eventId: typeof eventId === 'string' ? eventId : undefined,
      consentTermsVersion: typeof consentTermsVersion === 'string' ? consentTermsVersion : undefined,
      consentAcceptedAt: typeof consentAcceptedAt === 'string' ? consentAcceptedAt : undefined,
    };
  }
  return (await req.json()) as EventCheckoutPayload;
}

async function handle(req: Request): Promise<Response> {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: 'Servizio biglietti temporaneamente non disponibile.' }, { status: 503 });
  }

  const session = await auth().catch(() => null);
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required', loginUrl: '/login?callbackUrl=' + encodeURIComponent('/eventi') },
      { status: 401 },
    );
  }
  const userEmail = normalizeEmail(session.user.email);
  if (!userEmail) {
    return NextResponse.json({ error: 'Email autenticata non valida.' }, { status: 400 });
  }

  let payload: EventCheckoutPayload;
  try {
    payload = await readPayload(req);
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const eventId = typeof payload.eventId === 'string' ? payload.eventId.trim() : '';
  if (!eventId) {
    return NextResponse.json({ error: 'Evento non specificato.' }, { status: 400 });
  }

  const consentTermsVersion =
    typeof payload.consentTermsVersion === 'string' && CONSENT_VERSION_RE.test(payload.consentTermsVersion)
      ? payload.consentTermsVersion
      : null;
  let consentAcceptedAt: Date | null = null;
  if (typeof payload.consentAcceptedAt === 'string' && payload.consentAcceptedAt.length > 0) {
    const t = new Date(payload.consentAcceptedAt);
    if (!Number.isNaN(t.getTime())) consentAcceptedAt = t;
  }
  if (!consentTermsVersion || !consentAcceptedAt) {
    return NextResponse.json(
      { error: 'Accettazione dei Termini e del Disclaimer obbligatoria per l’acquisto del biglietto.' },
      { status: 400 },
    );
  }

  const priceId = getLiveEventPriceId();
  if (!priceId) {
    return NextResponse.json({ error: 'Vendita biglietti non configurata.' }, { status: 503 });
  }

  const event = await prisma.liveEvent.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      status: true,
      startsAt: true,
      endsAt: true,
      priceAmount: true,
      currency: true,
    },
  });
  if (!event || event.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Evento non disponibile per l’acquisto.' }, { status: 409 });
  }
  const startMs = event.startsAt.getTime();
  if (Number.isFinite(startMs) && startMs <= Date.now()) {
    return NextResponse.json({ error: 'L’evento è già iniziato o concluso.' }, { status: 409 });
  }

  const existing = await prisma.liveEventTicket.findUnique({
    where: { userEmail_eventId: { userEmail, eventId } },
    select: { status: true, checkoutSessionId: true },
  });
  if (existing?.status === 'succeeded') {
    return NextResponse.json(
      {
        error: 'Hai già un biglietto valido per questo evento.',
        redirectTo: '/area-membri/biglietti',
      },
      { status: 409 },
    );
  }

  let stripe: Stripe;
  try {
    stripe = getStripeClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe non configurato';
    return NextResponse.json({ error: message }, { status: 503 });
  }

  // Riusa una sessione ancora pagabile per evitare doppi addebiti.
  if (existing?.status === 'pending' && existing.checkoutSessionId) {
    try {
      const open = await stripe.checkout.sessions.retrieve(existing.checkoutSessionId);
      if (open.status === 'open' && open.url) {
        return NextResponse.json({ url: open.url, sessionId: open.id, reused: true });
      }
    } catch {
      // sessione non recuperabile: si procede con una nuova
    }
  }

  const baseUrl = resolveBaseUrl(req);
  const successUrl = new URL('/area-membri/biglietti', baseUrl);
  successUrl.searchParams.set('checkout', 'success');
  const cancelUrl = new URL('/eventi', baseUrl);
  cancelUrl.searchParams.set('checkout', 'cancelled');

  let checkoutSession: Stripe.Checkout.Session;
  try {
    checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'pay',
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        live_event_id: event.id,
        user_email: userEmail,
        consent_terms_v: consentTermsVersion,
        consent_at: consentAcceptedAt.toISOString(),
      },
      success_url: successUrl.toString() + '&session_id={CHECKOUT_SESSION_ID}',
      cancel_url: cancelUrl.toString(),
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore Stripe';
    console.error('[stripe:live-event-checkout] creazione sessione fallita', message);
    return NextResponse.json({ error: 'Impossibile preparare il pagamento. Riprova tra poco.' }, { status: 502 });
  }

  if (!checkoutSession.url) {
    return NextResponse.json({ error: 'Impossibile creare la sessione di pagamento.' }, { status: 502 });
  }

  try {
    await upsertPendingLiveEventTicket({
      eventId: event.id,
      userEmail,
      checkoutSessionId: checkoutSession.id,
      amountTotal: typeof checkoutSession.amount_total === 'number' ? checkoutSession.amount_total : event.priceAmount,
      currency: checkoutSession.currency || event.currency,
      consentTermsVersion,
      consentAcceptedAt,
    });
  } catch (err) {
    console.error('[stripe:live-event-checkout] salvataggio biglietto pending fallito', err);
  }

  return NextResponse.json({ url: checkoutSession.url, sessionId: checkoutSession.id });
}

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await auth().catch(() => null);
    const userEmail = normalizeEmail(session?.user?.email);

    let eventId: string | null = null;
    try {
      const payload = await readPayload(req.clone());
      if (typeof payload.eventId === 'string' && payload.eventId.trim().length > 0) {
        eventId = payload.eventId.trim();
      }
    } catch {
      eventId = null;
    }

    const key = userEmail && eventId ? `${userEmail}:${eventId}` : null;
    if (key) {
      const pending = inFlightByKey.get(key);
      if (pending) return await pending;
    }

    const task = handle(req);
    if (key) inFlightByKey.set(key, task);
    try {
      return await task;
    } finally {
      if (key) inFlightByKey.delete(key);
    }
  } catch (err) {
    console.error('[stripe:live-event-checkout] errore imprevisto', err);
    return NextResponse.json({ error: 'Errore durante la preparazione del pagamento.' }, { status: 500 });
  }
}
