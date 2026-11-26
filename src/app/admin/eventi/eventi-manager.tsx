'use client';

import { useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Archive,
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Ticket,
  Undo2,
  X,
} from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import {
  actionCreateLiveEvent,
  actionSaveLiveEvent,
  actionSetLiveEventStatus,
} from './actions';
import {
  LIVE_EVENT_DEFAULT_DURATION_MIN,
  LIVE_EVENT_MAX_DURATION_MIN,
  LIVE_EVENT_MIN_DURATION_MIN,
  LIVE_EVENT_PRICE_LABEL,
  LIVE_EVENT_STATUS_LABELS,
  formatRomeDateTime,
  type LiveEventAdminRow,
  type LiveEventActionResult,
  type LiveEventManageableStatus,
} from '@/lib/admin/live-event-shared';

const FIELD_CLASS =
  'mt-2 h-10 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none disabled:opacity-50';
const TEXTAREA_CLASS =
  'mt-2 w-full min-w-0 resize-none rounded-lg border border-av-line bg-av-bg-2/60 px-3 py-2 text-sm leading-relaxed text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none disabled:opacity-50';
const LABEL_CLASS =
  'text-[11px] font-semibold uppercase tracking-wider text-av-muted';
const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-av-green px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white focus-visible:outline-av-green disabled:opacity-40';
const BTN_GHOST =
  'inline-flex items-center gap-1.5 rounded-xl border border-av-line bg-av-bg-2/50 px-3 py-2 text-xs font-semibold text-av-muted transition-colors hover:border-av-green-deep/50 hover:text-white disabled:opacity-40';

const STATUS_BADGE: Record<LiveEventAdminRow['status'], string> = {
  DRAFT: 'border-av-yellow-deep/40 bg-av-yellow/10 text-av-yellow',
  PUBLISHED: 'border-av-green-deep/40 bg-av-green/10 text-av-green',
  ARCHIVED: 'border-av-line bg-av-bg-2/70 text-av-muted',
  CANCELLED: 'border-red-500/40 bg-red-500/10 text-red-300',
};

interface EventFieldsDefaults {
  title?: string;
  description?: string;
  startsAtLocalInput?: string;
  durationMin?: number;
  meetUrl?: string;
  replayUrl?: string;
}

/** Campi evento condivisi tra il form di creazione e il form di modifica. */
function EventFields({ defaults }: { defaults?: EventFieldsDefaults }) {
  return (
    <>
      <label className="block sm:col-span-2">
        <span className={LABEL_CLASS}>Titolo</span>
        <input
          name="title"
          type="text"
          required
          maxLength={255}
          defaultValue={defaults?.title}
          placeholder="es. Sessione live: setup operativo settimanale"
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASS}>Data e ora (fuso Europe/Rome)</span>
        <input
          name="startsAt"
          type="datetime-local"
          required
          defaultValue={defaults?.startsAtLocalInput}
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASS}>Durata (minuti)</span>
        <input
          name="durationMin"
          type="number"
          inputMode="numeric"
          min={LIVE_EVENT_MIN_DURATION_MIN}
          max={LIVE_EVENT_MAX_DURATION_MIN}
          step={5}
          defaultValue={defaults?.durationMin ?? LIVE_EVENT_DEFAULT_DURATION_MIN}
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASS}>Link Google Meet (privato)</span>
        <input
          name="meetUrl"
          type="url"
          defaultValue={defaults?.meetUrl ?? ''}
          placeholder="https://meet.google.com/..."
          className={FIELD_CLASS}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASS}>Link replay (opzionale)</span>
        <input
          name="replayUrl"
          type="url"
          defaultValue={defaults?.replayUrl ?? ''}
          placeholder="https://..."
          className={FIELD_CLASS}
        />
      </label>

      <label className="block sm:col-span-2">
        <span className={LABEL_CLASS}>Descrizione</span>
        <textarea
          name="description"
          rows={3}
          maxLength={4000}
          defaultValue={defaults?.description ?? ''}
          placeholder="Programma, temi trattati, a chi è rivolto..."
          className={TEXTAREA_CLASS}
        />
      </label>
    </>
  );
}

interface Props {
  initial: LiveEventAdminRow[];
}

export default function EventiManager({ initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const run = (
    fn: () => Promise<LiveEventActionResult>,
    opts?: { busy?: string; onSuccess?: () => void },
  ) => {
    setBanner(null);
    if (opts?.busy !== undefined) setBusyId(opts.busy);
    startTransition(async () => {
      try {
        const res = await fn();
        if (res.ok) {
          opts?.onSuccess?.();
          setBanner({ ok: true, text: res.message ?? 'Operazione completata.' });
          router.refresh();
        } else {
          setBanner({ ok: false, text: res.error ?? 'Operazione non riuscita.' });
        }
      } finally {
        if (opts?.busy !== undefined) setBusyId(null);
      }
    });
  };

  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    run(() => actionCreateLiveEvent(formData), { onSuccess: () => form.reset() });
  };

  const handleSave = (e: FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    run(() => actionSaveLiveEvent(id, formData), {
      busy: id,
      onSuccess: () => setEditingId(null),
    });
  };

  const setStatus = (id: string, status: LiveEventManageableStatus) => {
    run(() => actionSetLiveEventStatus(id, status), { busy: id });
  };

  return (
    <div className="space-y-5">
      {banner ? (
        <p
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            banner.ok ? 'text-av-green' : 'text-red-300'
          }`}
        >
          {banner.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {banner.text}
        </p>
      ) : null}

      <GlassCard className="overflow-hidden p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
            <Plus className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-white">Nuovo evento</h2>
            <p className="mt-1 text-xs leading-relaxed text-av-muted">
              L&apos;evento viene creato in bozza. Prezzo fisso del biglietto{' '}
              <span className="font-semibold text-white">{LIVE_EVENT_PRICE_LABEL}</span> — non
              modificabile. Lo slug è generato dal titolo e resta stabile.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="mt-4 grid gap-3 sm:grid-cols-2">
          <EventFields />
          <div className="sm:col-span-2">
            <button type="submit" disabled={isPending} className={BTN_PRIMARY}>
              {isPending && busyId === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              CREA EVENTO
            </button>
          </div>
        </form>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <h2 className="font-display text-base font-semibold text-white">
            Eventi ({initial.length})
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs text-av-muted">
            <Ticket className="h-3.5 w-3.5 text-av-green" aria-hidden="true" />
            Biglietti venduti (pagamenti riusciti)
          </span>
        </div>

        {initial.length === 0 ? (
          <div className="border-t border-av-line p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
                <CalendarClock className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">Nessun evento creato</p>
                <p className="mt-1 text-xs text-av-muted">
                  Crea il primo evento usando il modulo sopra. Nessuna cancellazione fisica è
                  prevista: gli eventi si archiviano.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-av-line border-t border-av-line">
            {initial.map((event) => {
              const isEditing = editingId === event.id;
              const busy = isPending && busyId === event.id;
              return (
                <li key={event.id} className="px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-semibold text-white sm:text-base">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            STATUS_BADGE[event.status]
                          }`}
                        >
                          {LIVE_EVENT_STATUS_LABELS[event.status]}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-av-line bg-av-bg-2/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-muted">
                          <Ticket className="h-2.5 w-2.5" aria-hidden="true" />
                          {event.ticketsSold} venduti
                        </span>
                      </div>

                      {event.description ? (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-av-muted/95">
                          {event.description}
                        </p>
                      ) : null}

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-av-muted">
                        <span className="inline-flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" aria-hidden="true" />
                          {formatRomeDateTime(event.startsAtIso)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {event.durationMin} min
                        </span>
                        <span>Prezzo: {LIVE_EVENT_PRICE_LABEL}</span>
                        <span className="inline-flex items-center gap-1">
                          {event.meetUrl ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-av-green" aria-hidden="true" />
                              Meet configurato
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 text-av-yellow" aria-hidden="true" />
                              Meet mancante
                            </>
                          )}
                        </span>
                        <span className="text-av-muted/70">slug: {event.slug}</span>
                      </div>
                    </div>

                    <div className="flex flex-none flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(isEditing ? null : event.id)}
                        aria-expanded={isEditing}
                        aria-controls={`edit-event-${event.id}`}
                        disabled={busy}
                        className={BTN_GHOST}
                      >
                        {isEditing ? (
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {isEditing ? 'Chiudi' : 'Modifica'}
                      </button>

                      {event.status !== 'PUBLISHED' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(event.id, 'PUBLISHED')}
                          disabled={busy}
                          className={BTN_GHOST}
                        >
                          <Send className="h-3.5 w-3.5" aria-hidden="true" />
                          Pubblica
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(event.id, 'DRAFT')}
                          disabled={busy}
                          className={BTN_GHOST}
                        >
                          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Riporta in bozza
                        </button>
                      )}

                      {event.status === 'ARCHIVED' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(event.id, 'DRAFT')}
                          disabled={busy}
                          className={BTN_GHOST}
                        >
                          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                          Ripristina
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setStatus(event.id, 'ARCHIVED')}
                          disabled={busy}
                          className={BTN_GHOST}
                        >
                          <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                          Archivia
                        </button>
                      )}

                      {busy ? <Loader2 className="h-4 w-4 animate-spin text-av-muted" /> : null}
                    </div>
                  </div>

                  {isEditing ? (
                    <form
                      id={`edit-event-${event.id}`}
                      onSubmit={(e) => handleSave(e, event.id)}
                      className="mt-4 grid gap-3 rounded-xl border border-av-line bg-av-bg-2/40 p-4 sm:grid-cols-2"
                    >
                      <EventFields
                        defaults={{
                          title: event.title,
                          description: event.description ?? '',
                          startsAtLocalInput: event.startsAtLocalInput,
                          durationMin: event.durationMin,
                          meetUrl: event.meetUrl ?? '',
                          replayUrl: event.replayUrl ?? '',
                        }}
                      />
                      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                        <button type="submit" disabled={busy} className={BTN_PRIMARY}>
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Pencil className="h-4 w-4" />
                          )}
                          SALVA MODIFICHE
                        </button>
                        <span className="text-[11px] text-av-muted">
                          Slug stabile: <code className="font-mono text-av-green/90">{event.slug}</code>
                        </span>
                      </div>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      <div className="flex items-start gap-2.5 rounded-xl border border-av-line bg-av-bg-2/40 px-4 py-3 text-xs leading-relaxed text-av-muted">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-av-green" aria-hidden="true" />
        <p>
          Link Meet e replay sono dati privati: restano visibili solo qui e non vengono mai
          esposti nelle pagine pubbliche. Gli eventi non si eliminano fisicamente: usa
          <span className="text-white"> Archivia</span>. La gestione degli annullamenti con
          biglietti già venduti sarà introdotta nella fase pagamenti/rimborsi.
        </p>
      </div>
    </div>
  );
}
