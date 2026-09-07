'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import type { ContentStatus, VideoSourceType } from '@prisma/client';
import GlassCard from '@/components/ui/GlassCard';
import YouTubeEmbed from '@/components/members/YouTubeEmbed';
import ProgressReporter from '@/components/members/ProgressReporter';
import type { FlatFullLesson } from '@/lib/db/course-queries';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpenCheck,
  Lock,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Play,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ListOrdered,
  Eye,
} from 'lucide-react';

interface ViewerLink {
  label: string;
  href?: string;
  title?: string;
}

interface ViewerLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number | null;
  youtubeId: string | null;
  videoSourceType: VideoSourceType;
  youtubeVideoId: string | null;
  bunnyVideoId: string | null;
  status: ContentStatus;
}

interface ViewerModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

interface ViewerCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
}

interface Props {
  course: ViewerCourse;
  courseLocked: boolean;
  module: ViewerModule;
  lesson: ViewerLesson;
  prev?: ViewerLink;
  next?: ViewerLink;
  progressPct?: number;
  completedCount?: number;
  lessonNumber?: number;
  totalLessons?: number;
  isPreview?: boolean;
  resumeStartSec?: number;
  lessonsFlat?: FlatFullLesson[];
  completedLessonIds?: string[];
}

function buildLessonHref(courseSlug: string, moduleSlug: string, lessonSlug: string) {
  return `/area-membri/corsi/${encodeURIComponent(courseSlug)}/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(lessonSlug)}`;
}

export default function LessonViewer({
  course,
  courseLocked,
  module,
  lesson,
  prev,
  next,
  progressPct = 0,
  completedCount = 0,
  lessonNumber = 0,
  totalLessons = 0,
  isPreview = false,
  resumeStartSec,
  lessonsFlat = [],
  completedLessonIds = [],
}: Props) {
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const completedIds = useMemo(
    () => new Set<string>(completedLessonIds.filter(Boolean)),
    [completedLessonIds],
  );

  const effectiveLessonsFlat = lessonsFlat;
  const activeId = lesson.id;
  const isDraft = lesson.status !== 'PUBLISHED';
  const draftBlocked = isDraft && !isPreview;

  const durationSec =
    typeof lesson.durationMin === 'number' && lesson.durationMin > 0
      ? lesson.durationMin * 60
      : undefined;

  const renderPlayer = () => {
    if (lesson.videoSourceType === 'BUNNY_STREAM' && lesson.bunnyVideoId) {
      return (
        <div className="aspect-video w-full rounded-2xl border border-dashed border-av-yellow-deep/40 bg-av-bg-2/60 grid place-items-center overflow-hidden">
          <div className="max-w-xl px-6 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-av-yellow mb-3" />
            <p className="text-sm font-semibold text-white">
              Bunny Stream: provider non configurato
            </p>
            <p className="mt-2 text-xs leading-relaxed text-av-muted">
              Le credenziali Bunny Stream non sono ancora impostate nelle
              variabili d&apos;ambiente. Per attivare la riproduzione protetta con
              token a vita breve, configurare:
              <code className="mt-2 block rounded-lg border border-av-line bg-av-bg-2/80 p-2 text-[11px] text-av-green font-mono break-words">
                BUNNY_STREAM_API_KEY
                <br />
                BUNNY_STREAM_LIBRARY_ID
                <br />
                BUNNY_STREAM_CDN_HOSTNAME
              </code>
            </p>
            <p className="mt-3 text-[11px] text-av-muted/80">
              Fino a configurazione completata, il video non può essere
              riprodotto. Nessun fallback pubblico viene esposto.
            </p>
          </div>
        </div>
      );
    }

    if (lesson.videoSourceType === 'YOUTUBE' && lesson.youtubeVideoId) {
      return (
        <YouTubeEmbed
          youtubeId={lesson.youtubeVideoId}
          lessonTitle={lesson.title}
          startSec={resumeStartSec}
          durationSec={durationSec}
        />
      );
    }

    return (
      <div className="aspect-video w-full rounded-2xl border border-dashed border-av-line bg-av-bg-2/60 grid place-items-center">
        <div className="px-6 text-center">
          <Play className="mx-auto h-8 w-8 text-av-muted mb-3" />
          <p className="text-sm font-medium text-av-muted">
            Video non ancora disponibile
          </p>
          <p className="mt-2 text-xs text-av-muted/80">
            {isPreview
              ? 'Lezione in bozza: aggiungi e pubblica un video sorgente dal pannello Admin.'
              : 'Torna più tardi per vedere questa lezione.'}
          </p>
          {lesson.videoSourceType === 'BUNNY_STREAM' && !lesson.bunnyVideoId ? (
            <p className="mt-3 text-[11px] text-av-yellow/85">
              Sorgente Bunny Stream selezionata ma ID video non impostato.
            </p>
          ) : null}
          {lesson.videoSourceType === 'YOUTUBE' && !lesson.youtubeVideoId ? (
            <p className="mt-3 text-[11px] text-av-yellow/85">
              Sorgente YouTube selezionata ma URL/ID non impostato.
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  const renderLessonList = (compact = false) => (
    <div className={compact ? 'space-y-0.5' : 'space-y-1'}>
      {effectiveLessonsFlat.map((l, idx) => {
        const num = idx + 1;
        const isActive = l.lessonId === activeId;
        const isCompleted = completedIds.has(l.lessonId);
        const lessonDraft = l.status !== 'PUBLISHED';
        const href = buildLessonHref(l.courseSlug, l.moduleSlug, l.lessonSlug);
        return (
          <Link
            key={l.lessonId}
            href={href}
            prefetch={false}
            className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors ${
              isActive
                ? 'border border-av-green-deep/50 bg-av-green/[0.08]'
                : 'hover:bg-av-green/[0.04]'
            }`}
          >
            <span
              className={`mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-lg border font-mono text-[11px] font-bold transition-colors ${
                isActive
                  ? 'border-av-green-deep/50 bg-av-green/15 text-av-green shadow-glow-green-sm'
                  : isCompleted
                    ? 'border-av-green-deep/30 bg-av-green/10 text-av-green'
                    : 'border-av-line bg-av-surface/50 text-av-muted group-hover:border-av-green-deep/40 group-hover:text-av-green'
              }`}
            >
              {isCompleted && !isActive ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                num
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p
                  className={`truncate text-[13px] font-medium ${
                    isActive
                      ? 'text-white'
                      : isCompleted
                        ? 'text-white/90'
                        : 'text-white/80'
                  }`}
                >
                  {l.title}
                </p>
                {lessonDraft ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-av-yellow-deep/30 bg-av-yellow/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-av-yellow">
                    Bozza
                  </span>
                ) : null}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <ProgressReporter
        enabled={!courseLocked && !isDraft && !!lesson.id}
        lessonId={lesson.id}
        startSec={resumeStartSec}
        durationSec={durationSec}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/area-membri/percorsi"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna ai percorsi
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-av-muted">
            <span className="inline-flex items-center gap-1.5">
              <BookOpenCheck className="h-3.5 w-3.5 text-av-green" />
              {course.title}
            </span>
            <span className="opacity-50">/</span>
            <span>{module.title}</span>
            <span className="opacity-50">/</span>
            <span className="text-white">Lezione {lessonNumber || '?'}</span>
            {totalLessons ? (
              <span className="opacity-60">di {totalLessons}</span>
            ) : null}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {lesson.title}
            </h1>
            {isDraft ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-yellow">
                <CircleDot className="h-3 w-3" />
                Bozza
              </span>
            ) : null}
            {isPreview ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-green">
                <Eye className="h-3 w-3" />
                Anteprima admin
              </span>
            ) : null}
          </div>
          {lesson.durationMin ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-av-muted">
              <Clock className="h-3.5 w-3.5" />
              Durata: {lesson.durationMin} min
            </p>
          ) : null}
        </div>
        {!courseLocked && !draftBlocked && totalLessons > 0 ? (
          <div className="w-full sm:w-auto sm:min-w-[220px]">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted">
              <span>Avanzamento corso</span>
              <span className="text-white">
                {completedCount}/{totalLessons} · {progressPct}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-av-line bg-av-bg-2/80">
              <div
                className="h-full rounded-full bg-av-green transition-[width] duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {isPreview ? (
        <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-av-yellow">
                Modalità anteprima amministratore
              </p>
              <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
                Stai visualizzando questa lezione come amministratore.
                Le bozze non sono accessibili agli studenti.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Link
                  href={`/admin/corsi/${course.slug}/lezioni/${lesson.id}`}
                  className="btn-ghost !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 border-av-yellow-deep/30 text-av-yellow hover:bg-av-yellow/10"
                >
                  Modifica lezione
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={buildLessonHref(course.slug, module.slug, lesson.slug)}
                  className="btn-ghost !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5"
                >
                  Esci da anteprima
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {courseLocked ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <Lock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Percorso non ancora attivo
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Per accedere a questa lezione, attiva il percorso corrispondente.
                Tutti i dettagli sono disponibili sulla pagina dei percorsi.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/#percorsi"
                  className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
                >
                  Scopri i percorsi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/area-membri/percorsi"
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  <BookOpenCheck className="h-4 w-4 text-av-green" />
                  I miei percorsi
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : draftBlocked ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-yellow-deep/40 bg-av-yellow/5 text-av-yellow">
              <CircleDot className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Lezione non ancora pubblicata
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Questa lezione è attualmente in bozza. Verrà resa disponibile a
                breve non appena completata e pubblicata. Torna all&apos;indice del
                percorso per vedere le lezioni già accessibili.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href={`/area-membri/corsi/${encodeURIComponent(course.slug)}`}
                  className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
                >
                  <BookOpenCheck className="h-4 w-4" />
                  Torna all&apos;indice del corso
                </Link>
                <Link
                  href="/area-membri/percorsi"
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  I miei percorsi
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6 min-w-0">
            <GlassCard className="overflow-hidden p-2 sm:p-3">
              {renderPlayer()}
            </GlassCard>

            {lesson.description ? (
              <GlassCard className="overflow-hidden p-5 sm:p-6">
                <h2 className="font-display text-lg font-semibold text-white">
                  Note della lezione
                </h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-av-muted sm:text-base">
                  {lesson.description}
                </p>
              </GlassCard>
            ) : null}

            {effectiveLessonsFlat.length > 0 ? (
              <div className="lg:hidden">
                <button
                  type="button"
                  onClick={() => setMobileListOpen((v) => !v)}
                  className="w-full btn-ghost !py-3 !px-4 text-sm items-center justify-between gap-2"
                >
                  <span className="inline-flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-av-green" />
                    Elenco lezioni ({effectiveLessonsFlat.length})
                  </span>
                  {mobileListOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {mobileListOpen ? (
                  <GlassCard className="mt-3 overflow-hidden p-3 sm:p-4">
                    {renderLessonList(true)}
                  </GlassCard>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              {prev && prev.href ? (
                <Link
                  href={prev.href}
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2 max-w-full min-w-0"
                >
                  <ArrowLeft className="h-4 w-4 flex-none text-av-green" />
                  <span className="truncate">{prev.label}</span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
              {next && next.href ? (
                <Link
                  href={next.href}
                  className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 max-w-full min-w-0 shadow-glow-green-sm"
                >
                  <span className="truncate">{next.label}</span>
                  <ArrowRight className="h-4 w-4 flex-none" />
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}
            </div>
          </div>

          {effectiveLessonsFlat.length > 0 ? (
            <aside className="hidden lg:block">
              <GlassCard className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-av-line px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-4 w-4 text-av-green" />
                    <h3 className="text-sm font-semibold text-white">
                      Lezioni del corso
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted">
                    {lessonNumber || '?'}/{totalLessons || effectiveLessonsFlat.length}
                  </span>
                </div>
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
                  {renderLessonList()}
                </div>
              </GlassCard>
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}
