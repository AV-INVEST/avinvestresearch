'use client';

import Link from 'next/link';
import type { Course, Lesson, Module } from '@/data/courses';
import GlassCard from '@/components/ui/GlassCard';
import YouTubeEmbed from '@/components/members/YouTubeEmbed';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpenCheck,
  Lock,
} from 'lucide-react';

interface ViewerLink {
  label: string;
  href?: string;
  title?: string;
}

interface Props {
  course: Course;
  courseLocked: boolean;
  module: Module;
  lesson: Lesson;
  prev?: ViewerLink;
  next?: ViewerLink;
}

export default function LessonViewer({
  course,
  courseLocked,
  module,
  lesson,
  prev,
  next,
}: Props) {
  return (
    <div className="space-y-6">
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
            <span className="text-white">Lezione</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-semibold text-white sm:text-3xl">
            {lesson.title}
          </h1>
          {lesson.durationMin ? (
            <p className="mt-2 inline-flex items-center gap-2 text-xs text-av-muted">
              <Clock className="h-3.5 w-3.5" />
              Durata: {lesson.durationMin} min
            </p>
          ) : null}
        </div>
      </div>

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
      ) : (
        <>
          <GlassCard className="overflow-hidden p-2 sm:p-3">
            <YouTubeEmbed
              youtubeId={lesson.youtubeId}
              lessonTitle={lesson.title}
            />
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
        </>
      )}
    </div>
  );
}
