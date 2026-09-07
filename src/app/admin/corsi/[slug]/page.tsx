import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { listAdminCourses, ensureAdminCoursesBootstrap } from '@/lib/admin/course-admin';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CircleDot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Video,
  ChevronRight,
} from 'lucide-react';
import {
  LessonRowActions,
  CreateLessonBlock,
} from '@/components/admin/AdminCourseComponents';
import { buildLessonHref } from '@/lib/db/course-queries';
import { lessonSourceLabel } from '@/lib/admin/course-labels';

export const dynamic = 'force-dynamic';

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const session = await auth().catch(() => null);
  const isAdmin = session && isAdminSession(session as any);

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/corsi"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai corsi
        </Link>
        <GlassCard className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-white">
            Login richiesto
          </h1>
          <p className="mt-2 text-sm text-av-muted">
            Accedi con l&apos;account proprietario per gestire i contenuti.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/corsi"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai corsi
        </Link>
        <GlassCard className="border-red-500/30 bg-red-500/5 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <div>
              <h1 className="font-display text-2xl font-semibold text-white">
                Accesso negato
              </h1>
              <p className="mt-2 text-sm text-av-muted">
                Il tuo account non dispone delle autorizzazioni amministratore.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  await ensureAdminCoursesBootstrap();
  const list = await listAdminCourses();
  if (!list.ok) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin/corsi"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai corsi
        </Link>
        <GlassCard className="border-red-500/30 bg-red-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="font-semibold text-white">Errore caricamento</p>
              <p className="mt-1 text-sm text-av-muted">{list.error}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const course = list.courses.find((c) => c.slug === slug);
  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const publishedCount = course.modules.reduce(
    (s, m) => s + m.lessons.filter((l) => l.status === 'PUBLISHED').length,
    0,
  );
  const draftsCount = totalLessons - publishedCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-av-muted">
            <Link
              href="/admin"
              className="transition-colors hover:text-white"
            >
              Admin
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <Link
              href="/admin/corsi"
              className="transition-colors hover:text-white"
            >
              Corsi
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-white">{course.title}</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            {course.title}
          </h1>
          {course.subtitle ? (
            <p className="mt-2 text-sm text-av-muted sm:text-base">{course.subtitle}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              <Layers className="h-3 w-3" />
              {course.modules.length} moduli
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-green">
              <CheckCircle2 className="h-3 w-3" />
              {publishedCount} pubblicate
            </span>
            {draftsCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-yellow">
                <CircleDot className="h-3 w-3" />
                {draftsCount} bozze
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              <BookOpenCheck className="h-3 w-3" />
              {totalLessons} lezioni totali
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/area-membri/corsi/${course.slug}`}
            className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
            prefetch={false}
          >
            Anteprima pubblica
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {course.modules.length === 0 ? (
        <GlassCard className="p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Layers className="h-5 w-5 text-av-green" />
            <div>
              <p className="font-semibold text-white">Nessun modulo presente</p>
              <p className="mt-1 text-sm text-av-muted">
                Il corso verrà popolato in seguito.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {course.modules.map((m, idx) => {
        const pub = m.lessons.filter((l) => l.status === 'PUBLISHED').length;
        const dft = m.lessons.length - pub;
        return (
          <GlassCard key={m.id} className="overflow-hidden p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
                  <span className="font-display text-lg font-bold">{idx + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold text-white sm:text-xl">
                    {m.title}
                  </h2>
                  {m.description ? (
                    <p className="mt-1 text-sm text-av-muted line-clamp-2">
                      {m.description}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                      <BookOpenCheck className="h-3 w-3" />
                      {m.lessons.length} lezioni
                    </span>
                    {pub > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-green">
                        <CheckCircle2 className="h-3 w-3" />
                        {pub} pubblicate
                      </span>
                    ) : null}
                    {dft > 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-yellow">
                        <CircleDot className="h-3 w-3" />
                        {dft} bozze
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            {m.lessons.length === 0 ? (
              <div className="mt-5 rounded-xl border border-av-line bg-av-bg-2/30 px-4 py-3 text-sm text-av-muted">
                Nessuna lezione. Inizia creando la prima.
              </div>
            ) : (
              <div className="mt-5 divide-y divide-av-line overflow-hidden rounded-xl border border-av-line">
                {m.lessons.map((l, lIdx) => {
                  const src = lessonSourceLabel(l.videoSourceType as any);
                  const previewHref = buildLessonHref(course.slug, m.slug, l.slug);
                  const isPub = l.status === 'PUBLISHED';
                  return (
                    <div
                      key={l.id}
                      className="flex flex-col gap-3 bg-av-bg-2/30 px-4 py-4 sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-lg border border-av-line bg-av-surface/40 font-mono text-[12px] font-semibold text-av-muted">
                          {lIdx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-white sm:text-base">
                              {l.title}
                            </h3>
                            {isPub ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/50 bg-av-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-green">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Pubblicata
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-yellow">
                                <CircleDot className="h-2.5 w-2.5" />
                                Bozza
                              </span>
                            )}
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${src.cls}`}>
                              <Video className="h-2.5 w-2.5" />
                              {src.label}
                            </span>
                            {l.durationMin ? (
                              <span className="inline-flex items-center gap-1 rounded-full border border-av-line bg-av-bg-2/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-muted">
                                <Clock className="h-2.5 w-2.5" />
                                {l.durationMin} min
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 md:flex-none">
                        <LessonRowActions
                          courseSlug={course.slug}
                          lessonId={l.id}
                          lessonSlug={l.slug}
                          moduleSlug={m.slug}
                          status={l.status as any}
                          courseHref={previewHref}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-5">
              <CreateLessonBlock courseSlug={course.slug} moduleId={m.id} />
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
