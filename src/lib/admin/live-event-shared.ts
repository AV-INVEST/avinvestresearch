import type { LiveEventStatus } from '@prisma/client';

/**
 * Costanti e tipi condivisi per gli Eventi Live Premium.
 * Modulo "puro" (nessuna direttiva 'use server'): importabile da Server
 * Component, Server Action e Client Component.
 */

/** Prezzo fisso del biglietto, in centesimi. Non modificabile dall'admin. */
export const LIVE_EVENT_TICKET_PRICE_AMOUNT = 990;
export const LIVE_EVENT_TICKET_PRICE_CURRENCY = 'EUR';
export const LIVE_EVENT_PRICE_LABEL = '9,90 €';

export const LIVE_EVENT_DEFAULT_DURATION_MIN = 60;
export const LIVE_EVENT_MIN_DURATION_MIN = 15;
export const LIVE_EVENT_MAX_DURATION_MIN = 480;

/** Fuso di visualizzazione delle date (le date sono sempre salvate in UTC). */
export const LIVE_EVENT_TIME_ZONE = 'Europe/Rome';

/**
 * Immagini del biglietto (fronte/retro), caricate dal repository pubblico
 * tramite CDN. Sono asset grafici condivisi da tutti gli eventi.
 */
export const LIVE_EVENT_TICKET_IMAGE_FRONT =
  'https://cdn.jsdelivr.net/gh/AV-INVEST/avinvestresearch@main/assets/biglietto_fronte.webp';
export const LIVE_EVENT_TICKET_IMAGE_BACK =
  'https://cdn.jsdelivr.net/gh/AV-INVEST/avinvestresearch@main/assets/biglietto_retro.webp';

/** Anticipo con cui il link Google Meet diventa disponibile (60 minuti). */
export const LIVE_EVENT_MEET_ACCESS_LEAD_MINUTES = 60;

/** Stati gestibili dal pannello. CANCELLED è riservato alla fase pagamenti/rimborsi. */
export type LiveEventManageableStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export const LIVE_EVENT_STATUS_LABELS: Record<LiveEventStatus, string> = {
  DRAFT: 'Bozza',
  PUBLISHED: 'Pubblicato',
  CANCELLED: 'Annullato',
  ARCHIVED: 'Archiviato',
};

/** Riga evento così come consumata dal client admin (nessun link pubblico). */
export interface LiveEventAdminRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: LiveEventStatus;
  /** Inizio in UTC (stringa ISO). */
  startsAtIso: string;
  /** Inizio come valore per input datetime-local, già nel fuso Europe/Rome. */
  startsAtLocalInput: string;
  durationMin: number;
  meetUrl: string | null;
  replayUrl: string | null;
  /** Biglietti venduti (status succeeded). */
  ticketsSold: number;
  publishedAtIso: string | null;
}

export interface LiveEventActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
}

/**
 * Offset (in ms) del fuso `timeZone` rispetto a UTC per l'istante `date`.
 * Positivo a est di Greenwich (Europe/Rome: +1h inverno, +2h estate).
 */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return asUtc - date.getTime();
}

/**
 * Converte un valore di <input type="datetime-local"> ("YYYY-MM-DDTHH:mm"),
 * interpretato come ora locale di Europe/Rome, nell'istante UTC corrispondente.
 * Risoluzione a due passaggi per gestire i confini dell'ora legale.
 */
export function romeLocalInputToUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  if (Number.isNaN(guess)) return null;
  let offset = getTimeZoneOffsetMs(new Date(guess), LIVE_EVENT_TIME_ZONE);
  let ts = guess - offset;
  offset = getTimeZoneOffsetMs(new Date(ts), LIVE_EVENT_TIME_ZONE);
  ts = guess - offset;
  const result = new Date(ts);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** Converte un istante UTC nel valore per <input type="datetime-local"> in Europe/Rome. */
export function utcToRomeLocalInput(date: Date): string {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: LIVE_EVENT_TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

const romeDisplayFormatter = new Intl.DateTimeFormat('it-IT', {
  timeZone: LIVE_EVENT_TIME_ZONE,
  weekday: 'short',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Formatta una data (UTC) per la visualizzazione nel fuso Europe/Rome. */
export function formatRomeDateTime(value: Date | string | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return romeDisplayFormatter.format(date);
}
