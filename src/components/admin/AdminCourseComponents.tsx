'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Loader2,
  Pencil,
  Play,
  Eye,
  Sparkles,
  FileWarning,
} from 'lucide-react';
import type { AdminActionResult, ExtractYouTubeResult } from '@/lib/admin/course-admin';
import type { ContentStatus, VideoSourceType } from '@prisma/client';
import {
  actionPublishLesson,
  actionUnpublishLesson,
  actionReorderLesson,
  actionCreateLesson,
  actionSaveLesson,
} from '@/app/admin/corsi/actions';

interface LessonRowActionsProps {
  courseSlug: string;
  lessonId: string;
  lessonSlug: string;
  moduleSlug: string;
  status: ContentStatus;
  courseHref: string;
}

type State = AdminActionResult | null;

const initial: State = null;

function SmallButton(props: React.ComponentProps<'button'> & { tone?: 'primary' | 'ghost' | 'warn' }) {
  const { tone = 'ghost', className, children, ...rest } = props;
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed';
  const toneCls =
    tone === 'primary'
      ? 'border-av-green-deep/50 bg-av-green/10 text-av-green hover:bg-av-green/15'
      : tone === 'warn'
        ? 'border-av-yellow-deep/40 bg-av-yellow/5 text-av-yellow hover:bg-av-yellow/10'
        : 'border-av-line bg-av-bg-2/50 text-av-muted hover:border-av-green-deep/40 hover:text-white';
  return (
    <button className={`${base} ${toneCls} ${className || ''}`} {...rest}>
      {children}
    </button>
  );
}

function ResultBanner({ state, compact }: { state: State; compact?: boolean }) {
  if (!state) return null;
  const tone = state.ok
    ? 'border-av-green-deep/40 bg-av-green/5 text-av-green'
    : 'border-red-500/40 bg-red-500/5 text-red-300';
  const Icon = state.ok ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={state.ok ? 'status' : 'alert'}
      className={`mt-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${tone} ${
        compact ? '!mt-1.5 !px-2.5 !py-1.5' : ''
      }`}
    >
      <Icon className={`mt-0.5 h-3.5 w-3.5 flex-none ${state.ok ? '' : 'text-red-400'}`} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{state.ok ? 'Fatto' : 'Errore'}</p>
        {state.message || state.error ? (
          <p className="mt-0.5 leading-relaxed break-words opacity-90">
            {state.ok ? state.message : state.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function LessonRowActions(props: LessonRowActionsProps) {
  const { courseSlug, lessonId, status, courseHref } = props;
  const commonHiddens = (
    <>
      <input type="hidden" name="lessonId" value={lessonId} />
      <input type="hidden" name="courseSlug" value={courseSlug} />
    </>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/admin/corsi/${courseSlug}/lezioni/${lessonId}`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-av-line bg-av-bg-2/50 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-av-muted transition-all hover:border-av-green-deep/40 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
        Modifica
      </Link>
      <Link
        href={`${courseHref}?preview=1`}
        className="inline-flex items-center gap-1.5 rounded-lg border border-av-line bg-av-bg-2/50 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-av-muted transition-all hover:border-av-green-deep/40 hover:text-white"
        prefetch={false}
      >
        <Eye className="h-3.5 w-3.5" />
        Anteprima
      </Link>

      {status === 'DRAFT' ? (
        <form action={actionPublishLesson as any}>
          <div style={{ display: 'none' }}>{commonHiddens}</div>
          <PublishButton />
        </form>
      ) : (
        <form action={actionUnpublishLesson as any}>
          <div style={{ display: 'none' }}>{commonHiddens}</div>
          <UnpublishButton />
        </form>
      )}

      <form action={actionReorderLesson as any}>
        <div style={{ display: 'none' }}>
          {commonHiddens}
          <input type="hidden" name="direction" value="up" />
        </div>
        <SmallButton type="submit" aria-label="Sposta su">
          <ArrowUp className="h-3.5 w-3.5" />
          Su
        </SmallButton>
      </form>
      <form action={actionReorderLesson as any}>
        <div style={{ display: 'none' }}>
          {commonHiddens}
          <input type="hidden" name="direction" value="down" />
        </div>
        <SmallButton type="submit" aria-label="Sposta giu">
          <ArrowDown className="h-3.5 w-3.5" />
          Giu
        </SmallButton>
      </form>
    </div>
  );
}

function WrappedActionButton({
  action,
  children,
  formHiddens,
  ariaLabel,
  tone,
}: {
  action: any;
  children: React.ReactNode;
  formHiddens: React.ReactNode;
  ariaLabel?: string;
  tone?: 'primary' | 'ghost' | 'warn';
}) {
  const [state, formAction, isPending] = useActionState(action as any, initial);
  return (
    <div className="inline-flex flex-col">
      <form action={formAction} aria-label={ariaLabel}>
        <div style={{ display: 'none' }}>{formHiddens}</div>
        <SmallButton type="submit" tone={tone} disabled={isPending}>
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {children}
        </SmallButton>
      </form>
      <ResultBanner state={state} compact />
    </div>
  );
}

function PublishButton() {
  return (
    <SmallButton type="submit" tone="primary" title="Pubblica la lezione">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Pubblica
    </SmallButton>
  );
}

function UnpublishButton() {
  return (
    <SmallButton type="submit" tone="warn" title="Torna in bozza">
      <CircleDot className="h-3.5 w-3.5" />
      Bozza
    </SmallButton>
  );
}

export function CreateLessonBlock({
  courseSlug,
  moduleId,
}: {
  courseSlug: string;
  moduleId: string;
}) {
  const [state, formAction, isPending] = useActionState(actionCreateLesson as any, initial);

  useEffect(() => {
    if (state?.ok && (state.data as any)?.lessonId) {
      const id = (state.data as any).lessonId as string;
      const t = window.setTimeout(() => {
        window.location.assign(`/admin/corsi/${courseSlug}/lezioni/${id}`);
      }, 350);
      return () => window.clearTimeout(t);
    }
  }, [state, courseSlug]);

  return (
    <div className="rounded-xl border border-dashed border-av-line bg-av-bg-2/30 p-4 sm:p-5">
      <form action={formAction as any} className="space-y-3">
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <input type="hidden" name="moduleId" value={moduleId} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <label htmlFor={`nt-${moduleId.slice(-6)}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
              Titolo nuova lezione
            </label>
            <input
              id={`nt-${moduleId.slice(-6)}`}
              type="text"
              name="title"
              placeholder="Es: Analisi del timeframe giornaliero"
              className="mt-2 w-full rounded-xl border border-av-line bg-av-surface/50 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-av-green-deep/60 focus:shadow-glow-green-sm placeholder:text-av-muted/60"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Crea lezione in bozza
          </button>
        </div>
        <ResultBanner state={state} />
      </form>
    </div>
  );
}

const SOURCE_NONE = 'NESSUNO';
const SOURCE_YT = 'YouTube (testing)';
const SOURCE_BUNNY = 'Bunny Stream';

export function lessonSourceLabel(
  source: VideoSourceType | null | undefined,
): { label: string; cls: string } {
  if (!source || source === 'NONE') {
    return {
      label: SOURCE_NONE,
      cls: 'border-av-line text-av-muted bg-av-bg-2/60',
    };
  }
  if (source === 'YOUTUBE') {
    return {
      label: SOURCE_YT,
      cls: 'border-av-yellow-deep/30 bg-av-yellow/10 text-av-yellow',
    };
  }
  return {
    label: SOURCE_BUNNY,
    cls: 'border-av-green-deep/40 bg-av-green/10 text-av-green',
  };
}

export interface LessonEditorProps {
  lessonId: string;
  courseSlug: string;
  moduleSlug: string;
  lessonSlugSaved: string;
  initial: {
    title: string;
    description: string | null;
    durationMin: number | null;
    videoSourceType: VideoSourceType;
    youtubeVideoId: string | null;
    bunnyVideoId: string | null;
    status: ContentStatus;
  };
  previewUrl: string;
  youtubeWarning?: string | null;
}

export function LessonEditor(props: LessonEditorProps) {
  const { lessonId, courseSlug, moduleSlug, lessonSlugSaved, initial, previewUrl } = props;

  const [state, formAction, isPending] = useActionState(actionSaveLesson as any, null as State);
  const [source, setSource] = useState<VideoSourceType>(initial.videoSourceType || 'NONE');
  const youtubeRef = useRef<HTMLInputElement>(null);
  const bunnyRef = useRef<HTMLInputElement>(null);

  const ytResult: ExtractYouTubeResult = { ok: true, videoId: null, warning: null };

  return (
    <div className="space-y-6">
      <form action={formAction as any} className="grid gap-5">
        <input type="hidden" name="lessonId" value={lessonId} />
        <input type="hidden" name="courseSlug" value={courseSlug} />
        <input type="hidden" name="moduleSlug" value={moduleSlug} />
        <input type="hidden" name="lessonSlugSaved" value={lessonSlugSaved} />

        <div className="grid gap-5 sm:grid-cols-3">
          <div className="sm:col-span-2 space-y-4">
            <div>
              <label htmlFor="les-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                Titolo lezione
              </label>
              <input
                id="les-title"
                type="text"
                name="title"
                defaultValue={initial.title}
                required
                minLength={2}
                className="mt-2 w-full rounded-xl border border-av-line bg-av-surface/50 px-4 py-3 text-base text-white outline-none transition-all focus:border-av-green-deep/60 focus:shadow-glow-green-sm placeholder:text-av-muted/60"
              />
            </div>
            <div>
              <label htmlFor="les-desc" className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                Descrizione
              </label>
              <textarea
                id="les-desc"
                name="description"
                rows={5}
                defaultValue={initial.description ?? ''}
                placeholder="Di cosa parla questa lezione? Obiettivi e prerequisiti."
                className="mt-2 w-full resize-y rounded-xl border border-av-line bg-av-surface/50 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-all focus:border-av-green-deep/60 focus:shadow-glow-green-sm placeholder:text-av-muted/60"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="les-dur" className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                Durata (minuti)
              </label>
              <input
                id="les-dur"
                type="number"
                name="durationMin"
                min={1}
                step={1}
                defaultValue={initial.durationMin ?? ''}
                className="mt-2 w-full rounded-xl border border-av-line bg-av-surface/50 px-4 py-3 text-sm text-white outline-none transition-all focus:border-av-green-deep/60 focus:shadow-glow-green-sm placeholder:text-av-muted/60"
                placeholder="Es: 12"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                Stato pubblicazione
              </span>
              <div
                className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
                  initial.status === 'PUBLISHED'
                    ? 'border-av-green-deep/50 bg-av-green/10 text-av-green'
                    : 'border-av-yellow-deep/40 bg-av-yellow/10 text-av-yellow'
                }`}
              >
                {initial.status === 'PUBLISHED' ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <CircleDot className="h-3.5 w-3.5" />
                )}
                {initial.status === 'PUBLISHED' ? 'Pubblicata' : 'Bozza'}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-av-line bg-av-bg-2/40 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Play className="mt-0.5 h-5 w-5 text-av-green" />
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <p className="font-display text-base font-semibold text-white">
                  Video sorgente
                </p>
                <p className="mt-1 text-xs text-av-muted">
                  Configura la sorgente video. I riferimenti protetti non sono
                  esposti a visitatori non autorizzati.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <SourceChip
                  label={SOURCE_NONE}
                  active={source === 'NONE'}
                  onClick={() => setSource('NONE')}
                />
                <SourceChip
                  label={SOURCE_YT}
                  active={source === 'YOUTUBE'}
                  onClick={() => setSource('YOUTUBE')}
                  tone="warn"
                />
                <SourceChip
                  label={SOURCE_BUNNY}
                  active={source === 'BUNNY_STREAM'}
                  onClick={() => setSource('BUNNY_STREAM')}
                  tone="primary"
                />
              </div>

              <input type="hidden" name="videoSourceType" value={source} />

              {source === 'YOUTUBE' ? (
                <div className="space-y-3 rounded-xl border border-av-yellow-deep/20 bg-av-yellow/[0.03] p-4">
                  <div>
                    <label htmlFor="yt-url" className="text-xs font-semibold uppercase tracking-[0.16em] text-av-yellow">
                      URL YouTube o ID video
                    </label>
                    <input
                      ref={youtubeRef}
                      id="yt-url"
                      type="text"
                      name="youtubeRawUrl"
                      defaultValue={initial.youtubeVideoId ?? ''}
                      placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx oppure ID"
                      className="mt-2 w-full rounded-xl border border-av-line bg-av-surface/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-av-yellow-deep/60 placeholder:text-av-muted/60"
                    />
                    <p className="mt-2 text-[11px] leading-relaxed text-av-yellow/85">
                      <span className="font-semibold">Attenzione:</span> YouTube
                      mostrera il proprio marchio, i controlli del player e i
                      consigli al termine. Non e possibile nascondere il
                      branding o bloccare la condivisione. Usa solo per testing
                      temporaneo o contenuti non sensibili.
                    </p>
                  </div>
                </div>
              ) : null}

              {source === 'BUNNY_STREAM' ? (
                <div className="space-y-3 rounded-xl border border-av-green-deep/20 bg-av-green/[0.03] p-4">
                  <div>
                    <label htmlFor="bb-id" className="text-xs font-semibold uppercase tracking-[0.16em] text-av-green">
                      Bunny Stream: ID libreria o video
                    </label>
                    <input
                      ref={bunnyRef}
                      id="bb-id"
                      type="text"
                      name="bunnyVideoId"
                      defaultValue={initial.bunnyVideoId ?? ''}
                      placeholder="Identificativo video o GUID libreria"
                      className="mt-2 w-full rounded-xl border border-av-line bg-av-surface/60 px-4 py-3 text-sm text-white outline-none transition-all focus:border-av-green-deep/60 placeholder:text-av-muted/60"
                    />
                    <div className="mt-2 flex items-start gap-2 text-[11px] leading-relaxed">
                      <FileWarning className="mt-0.5 h-3.5 w-3.5 flex-none text-av-green" />
                      <p className="text-av-green/85">
                        Bunny Stream non ancora configurato: salva e gestisci
                        l&apos;attivazione prima di pubblicare. Senza
                        credenziali la riproduzione protetta non puo partire.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-av-line pt-5">
          <div className="max-w-md text-xs text-av-muted">
            I progressi degli studenti sono legati all&apos;ID della lezione:
            sostituire il video non cancella la storia individuale.
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={previewUrl}
              prefetch={false}
              className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Anteprima
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary !py-2.5 !px-5 text-sm items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvataggio in corso
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Salva modifiche
                </>
              )}
            </button>
          </div>
        </div>

        <ResultBanner state={state} />
      </form>
    </div>
  );
}

function SourceChip(props: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: 'primary' | 'warn';
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer select-none';
  let cls =
    'border-av-line bg-av-bg-2/60 text-av-muted hover:border-av-green-deep/40 hover:text-white';
  if (props.active) {
    if (props.tone === 'warn') {
      cls =
        'border-av-yellow-deep/50 bg-av-yellow/10 text-av-yellow shadow-[0_0_12px_rgba(255,183,77,0.12)]';
    } else if (props.tone === 'primary') {
      cls =
        'border-av-green-deep/50 bg-av-green/10 text-av-green shadow-glow-green-sm';
    } else {
      cls =
        'border-white/20 bg-white/5 text-white';
    }
  }
  return (
    <button type="button" onClick={props.onClick} className={`${base} ${cls}`}>
      {props.label}
    </button>
  );
}


