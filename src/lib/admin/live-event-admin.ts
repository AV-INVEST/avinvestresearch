'use server';

import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/course-admin';
import type { Prisma } from '@prisma/client';
import {
  LIVE_EVENT_DEFAULT_DURATION_MIN,
  LIVE_EVENT_MAX_DURATION_MIN,
  LIVE_EVENT_MIN_DURATION_MIN,
  romeLocalInputToUtc,
  utcToRomeLocalInput,
  type LiveEventActionResult,
  type LiveEventAdminRow,
  type LiveEventManageableStatus,
} from '@/lib/admin/live-event-shared';

const SORT_DESC: Prisma.SortOrder = 'desc';

const MANAGEABLE_STATUSES: LiveEventManageableStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 96);
}

function parseOptionalUrl(raw: string): { ok: boolean; value: string | null } {
  const value = raw.trim();
  if (!value) return { ok: true, value: null };
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return { ok: false, value: null };
    }
    return { ok: true, value: url.toString() };
  } catch {
    return { ok: false, value: null };
  }
}

function parseDurationMin(raw: FormDataEntryValue | null): number | null {
  const text = typeof raw === 'string' ? raw.trim() : '';
  if (!text) return LIVE_EVENT_DEFAULT_DURATION_MIN;
  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < LIVE_EVENT_MIN_DURATION_MIN || rounded > LIVE_EVENT_MAX_DURATION_MIN) {
    return null;
  }
  return rounded;
}

function durationFromDates(startsAt: Date, endsAt: Date | null): number {
  if (!endsAt) return LIVE_EVENT_DEFAULT_DURATION_MIN;
  const diff = Math.round((endsAt.getTime() - startsAt.getTime()) / 60000);
  return diff > 0 ? diff : LIVE_EVENT_DEFAULT_DURATION_MIN;
}

type LiveEventWithCount = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: LiveEventAdminRow['status'];
  startsAt: Date;
  endsAt: Date | null;
  meetUrl: string | null;
  replayUrl: string | null;
  publishedAt: Date | null;
  _count: { tickets: number };
};

function toRow(event: LiveEventWithCount): LiveEventAdminRow {
  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    description: event.description,
    status: event.status,
    startsAtIso: event.startsAt.toISOString(),
    startsAtLocalInput: utcToRomeLocalInput(event.startsAt),
    durationMin: durationFromDates(event.startsAt, event.endsAt),
    meetUrl: event.meetUrl,
    replayUrl: event.replayUrl,
    ticketsSold: event._count.tickets,
    publishedAtIso: event.publishedAt ? event.publishedAt.toISOString() : null,
  };
}

async function uniqueSlug(base: string): Promise<string> {
  let candidate = base;
  for (let i = 2; i <= 60; i += 1) {
    const exists = await prisma.liveEvent.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function listLiveEventsAdmin(): Promise<LiveEventAdminRow[]> {
  const guard = await requireAdmin();
  if (!guard.ok) return [];
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.liveEvent.findMany({
    orderBy: [{ startsAt: SORT_DESC }, { createdAt: SORT_DESC }],
    include: {
      _count: { select: { tickets: { where: { status: 'succeeded' } } } },
    },
  });
  return rows.map(toRow);
}

/** Campi evento validati a partire dal FormData del pannello admin. */
interface ParsedLiveEventFields {
  title: string;
  description: string | null;
  startsAt: Date;
  endsAt: Date;
  meetUrl: string | null;
  replayUrl: string | null;
}

function parseLiveEventFields(
  formData: FormData,
): { ok: true; fields: ParsedLiveEventFields } | { ok: false; error: string } {
  const title = String(formData.get('title') ?? '').trim().slice(0, 255);
  if (!title) return { ok: false, error: 'Il titolo è obbligatorio.' };

  const description = String(formData.get('description') ?? '').trim().slice(0, 4000);

  const startsAt = romeLocalInputToUtc(String(formData.get('startsAt') ?? ''));
  if (!startsAt) return { ok: false, error: 'Data e ora non valide.' };

  const durationMin = parseDurationMin(formData.get('durationMin'));
  if (durationMin === null) {
    return {
      ok: false,
      error: `Durata non valida: usa un valore tra ${LIVE_EVENT_MIN_DURATION_MIN} e ${LIVE_EVENT_MAX_DURATION_MIN} minuti.`,
    };
  }

  const meet = parseOptionalUrl(String(formData.get('meetUrl') ?? ''));
  if (!meet.ok) return { ok: false, error: 'Link Google Meet non valido (usa un URL http/https).' };

  const replay = parseOptionalUrl(String(formData.get('replayUrl') ?? ''));
  if (!replay.ok) return { ok: false, error: 'Link replay non valido (usa un URL http/https).' };

  return {
    ok: true,
    fields: {
      title,
      description: description.length > 0 ? description : null,
      startsAt,
      endsAt: new Date(startsAt.getTime() + durationMin * 60000),
      meetUrl: meet.value,
      replayUrl: replay.value,
    },
  };
}

export async function createLiveEventAdmin(formData: FormData): Promise<LiveEventActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsed = parseLiveEventFields(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  try {
    const base = slugify(parsed.fields.title) || `evento-${Date.now().toString(36)}`;
    const slug = await uniqueSlug(base);
    const created = await prisma.liveEvent.create({
      data: {
        slug,
        title: parsed.fields.title,
        description: parsed.fields.description,
        startsAt: parsed.fields.startsAt,
        endsAt: parsed.fields.endsAt,
        meetUrl: parsed.fields.meetUrl,
        replayUrl: parsed.fields.replayUrl,
        status: 'DRAFT',
      },
      select: { id: true },
    });
    revalidatePath('/admin/eventi');
    revalidatePath('/admin');
    return { ok: true, id: created.id, message: 'Evento creato in bozza.' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore durante la creazione dell'evento.",
    };
  }
}

export async function saveLiveEventAdmin(
  id: string,
  formData: FormData,
): Promise<LiveEventActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const existing = await prisma.liveEvent.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: 'Evento non trovato.' };

  const parsed = parseLiveEventFields(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  try {
    // Slug e stato NON vengono toccati in modifica: lo slug resta stabile.
    await prisma.liveEvent.update({
      where: { id },
      data: {
        title: parsed.fields.title,
        description: parsed.fields.description,
        startsAt: parsed.fields.startsAt,
        endsAt: parsed.fields.endsAt,
        meetUrl: parsed.fields.meetUrl,
        replayUrl: parsed.fields.replayUrl,
      },
      select: { id: true },
    });
    revalidatePath('/admin/eventi');
    revalidatePath('/admin');
    return { ok: true, message: 'Modifiche salvate.' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore durante il salvataggio dell'evento.",
    };
  }
}

export async function setLiveEventStatusAdmin(
  id: string,
  status: LiveEventManageableStatus,
): Promise<LiveEventActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!MANAGEABLE_STATUSES.includes(status)) {
    return { ok: false, error: 'Stato non valido.' };
  }

  const existing = await prisma.liveEvent.findUnique({
    where: { id },
    select: { id: true, publishedAt: true, meetUrl: true },
  });
  if (!existing) return { ok: false, error: 'Evento non trovato.' };

  if (status === 'PUBLISHED' && !existing.meetUrl) {
    return {
      ok: false,
      error: 'Impossibile pubblicare: aggiungi prima il link Google Meet nell\u2019evento.',
    };
  }

  const data: Prisma.LiveEventUpdateInput = { status };
  if (status === 'PUBLISHED' && !existing.publishedAt) data.publishedAt = new Date();

  try {
    await prisma.liveEvent.update({ where: { id }, data });
    revalidatePath('/admin/eventi');
    revalidatePath('/admin');
    const message =
      status === 'PUBLISHED'
        ? 'Evento pubblicato.'
        : status === 'ARCHIVED'
          ? 'Evento archiviato.'
          : 'Evento riportato in bozza.';
    return { ok: true, message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Errore durante l'aggiornamento stato.",
    };
  }
}
