import type { LiveEventTicketStatus } from '@prisma/client';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import {
  LIVE_EVENT_DEFAULT_DURATION_MIN,
  LIVE_EVENT_MEET_ACCESS_LEAD_MINUTES,
} from '@/lib/admin/live-event-shared';

/**
 * Biglietti dell'utente per l'area membri, con gating lato server:
 * - Il link Google Meet è valorizzato solo se il biglietto è valido e ci si
 *   trova nella finestra di accesso (da 60 minuti prima fino a fine evento).
 * - Il link replay è valorizzato solo dopo lo svolgimento dell'evento e per
 *   biglietti validi.
 * Gli URL non disponibili restano `null`: non vengono mai serializzati al client.
 */

export interface MemberLiveEventTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDescription: string | null;
  eventSlug: string;
  startsAtIso: string;
  endsAtIso: string | null;
  status: LiveEventTicketStatus;
  purchasedAtIso: string | null;
  amountTotal: number;
  currency: string;
  /** Istante (ISO) da cui il link Meet diventa disponibile. */
  meetAvailableFromIso: string | null;
  /** Presente solo quando l'accesso Meet è consentito adesso. */
  meetUrl: string | null;
  /** Presente solo quando il replay è disponibile. */
  replayUrl: string | null;
}

export interface MemberLiveEventsSummary {
  upcoming: MemberLiveEventTicket[];
  past: MemberLiveEventTicket[];
  hasAny: boolean;
}

const EMPTY: MemberLiveEventsSummary = { upcoming: [], past: [], hasAny: false };

export async function listMemberLiveEventTickets(
  userEmailRaw: string | null | undefined,
  now: Date = new Date(),
): Promise<MemberLiveEventsSummary> {
  const email = normalizeEmail(userEmailRaw);
  if (!email || !isDatabaseConfigured()) return EMPTY;

  try {
    const rows = await prisma.liveEventTicket.findMany({
      where: { userEmail: email },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        status: true,
        purchasedAt: true,
        amountTotal: true,
        currency: true,
        event: {
          select: {
            slug: true,
            title: true,
            description: true,
            startsAt: true,
            endsAt: true,
            status: true,
            meetUrl: true,
            replayUrl: true,
          },
        },
      },
    });

    const nowMs = now.getTime();
    const tickets: MemberLiveEventTicket[] = rows.map((row) => {
      const ev = row.event;
      const startMs = ev.startsAt.getTime();
      const endMs = ev.endsAt
        ? ev.endsAt.getTime()
        : startMs + LIVE_EVENT_DEFAULT_DURATION_MIN * 60_000;
      const valid = row.status === 'succeeded' && ev.status !== 'CANCELLED';

      const meetWindowStartMs = startMs - LIVE_EVENT_MEET_ACCESS_LEAD_MINUTES * 60_000;
      const meetAvailable = valid && nowMs >= meetWindowStartMs && nowMs <= endMs;
      const replayAvailable = valid && nowMs > endMs;

      return {
        id: row.id,
        eventId: row.eventId,
        eventTitle: ev.title,
        eventDescription: ev.description,
        eventSlug: ev.slug,
        startsAtIso: ev.startsAt.toISOString(),
        endsAtIso: ev.endsAt ? ev.endsAt.toISOString() : null,
        status: row.status,
        purchasedAtIso: row.purchasedAt ? row.purchasedAt.toISOString() : null,
        amountTotal: row.amountTotal,
        currency: row.currency,
        meetAvailableFromIso: valid ? new Date(meetWindowStartMs).toISOString() : null,
        meetUrl: meetAvailable ? ev.meetUrl ?? null : null,
        replayUrl: replayAvailable ? ev.replayUrl ?? null : null,
      };
    });

    const upcoming: MemberLiveEventTicket[] = [];
    const past: MemberLiveEventTicket[] = [];
    for (const t of tickets) {
      const startMs = new Date(t.startsAtIso).getTime();
      const endMs = t.endsAtIso
        ? new Date(t.endsAtIso).getTime()
        : startMs + LIVE_EVENT_DEFAULT_DURATION_MIN * 60_000;
      if (nowMs <= endMs) upcoming.push(t);
      else past.push(t);
    }
    upcoming.sort((a, b) => new Date(a.startsAtIso).getTime() - new Date(b.startsAtIso).getTime());

    return { upcoming, past, hasAny: tickets.length > 0 };
  } catch (err) {
    console.error('[live-events:member] caricamento biglietti fallito', err);
    return EMPTY;
  }
}
