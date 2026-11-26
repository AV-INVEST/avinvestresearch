import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

/**
 * Query pubblica degli Eventi Live Premium.
 *
 * Seleziona deliberatamente solo i campi pubblici: i link privati
 * (`meetUrl`, `replayUrl`) NON vengono mai letti qui, così non possono
 * finire nell'HTML pubblico, in API non autorizzate o nei metadata.
 */

export interface PublicLiveEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  /** Inizio in UTC (ISO). */
  startsAtIso: string;
  endsAtIso: string | null;
  priceAmount: number;
  currency: string;
}

export interface PublicLiveEventsResult {
  upcoming: PublicLiveEvent[];
  past: PublicLiveEvent[];
}

const EMPTY: PublicLiveEventsResult = { upcoming: [], past: [] };

export async function listPublicLiveEvents(now: Date = new Date()): Promise<PublicLiveEventsResult> {
  if (!isDatabaseConfigured()) return EMPTY;
  try {
    const rows = await prisma.liveEvent.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        startsAt: true,
        endsAt: true,
        priceAmount: true,
        currency: true,
      },
      orderBy: { startsAt: 'asc' },
    });

    const upcoming: PublicLiveEvent[] = [];
    const past: PublicLiveEvent[] = [];
    const nowMs = now.getTime();

    for (const r of rows) {
      const item: PublicLiveEvent = {
        id: r.id,
        slug: r.slug,
        title: r.title,
        description: r.description,
        startsAtIso: r.startsAt.toISOString(),
        endsAtIso: r.endsAt ? r.endsAt.toISOString() : null,
        priceAmount: r.priceAmount,
        currency: r.currency,
      };
      if (r.startsAt.getTime() > nowMs) upcoming.push(item);
      else past.push(item);
    }

    // Storico: evento più recente in cima.
    past.reverse();

    return { upcoming, past };
  } catch (err) {
    console.error('[live-events:public] caricamento eventi pubblici fallito', err);
    return EMPTY;
  }
}
