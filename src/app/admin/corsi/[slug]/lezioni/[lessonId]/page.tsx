import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import {
  ensureAdminCoursesBootstrap,
  getAdminLessonDetail,
} from '@/lib/admin/course-admin';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  BookOpenCheck,
} from 'lucide-react';
import { LessonEditor } from '@/components/admin/AdminCourseComponents';
import { buildLessonHref } from '@/lib/db/course-queries';
import { actionPublishLesson, actionUnpublishLesson } from '@/app/admin/corsi/actions';

export const dynamic = 'force-dynamic';

export default async function AdminLessonEditorPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;

  const session = await auth().catch(() => null);
  const isAdmin = session && isAdminSession(session as any);

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <Link
          href={`/admin/corsi/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al corso
        </Link>
        <GlassCard className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-white">
            Login richiesto
          </h1>
          <p className="mt-2 text-sm text-av-muted">
            Accedi con l&apos;account proprietario per modificare i contenuti.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <Link
          href={`/admin/corsi/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al corso
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
  const detail = await getAdminLessonDetail(lessonId);
  if (!detail.ok || !detail.lesson) {
    if (detail.error === 'Lezione non trovata.') {
      notFound();
    }
    return (
      <div className="space-y-6">
        <Link
          href={`/admin/corsi/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna al corso
        </Link>
        <GlassCard className="border-red-500/30 bg-red-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="font-semibold text-white">Errore caricamento</p>
              <p className="mt-1 text-sm text-av-muted">{detail.error}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const lesson = detail.lesson;
  const lessonModule = lesson.module;
  const course = lessonModule.course;
  if (course.slug !== slug) notFound();

  const previewUrl = `${buildLessonHref(course.slug, lessonModule.slug, lesson.slug)}?preview=1`;

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
            <Link
              href={`/admin/corsi/${course.slug}`}
              className="transition-colors hover:text-white"
            >
              {course.title}
            </Link>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-white line-clamp-1">Modifica lezione</span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            {lesson.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              <BookOpenCheck className="h-3 w-3" />
              Modulo: {lessonModule.title}
            </span>
            {lesson.status === 'PUBLISHED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/50 bg-av-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-green">
                <CheckCircle2 className="h-3 w-3" />
                Pubblicata
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-yellow">
                <CircleDot className="h-3 w-3" />
                Bozza
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/admin/corsi/${course.slug}`}
            className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna al corso
          </Link>
          {lesson.status === 'DRAFT' ? (
            <form action={actionPublishLesson as any}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <button
                type="submit"
                className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Pubblica
              </button>
            </form>
          ) : (
            <form action={actionUnpublishLesson as any}>
              <input type="hidden" name="lessonId" value={lesson.id} />
              <input type="hidden" name="courseSlug" value={course.slug} />
              <button
                type="submit"
                className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2 border-av-yellow-deep/40 text-av-yellow hover:bg-av-yellow/10"
              >
                <CircleDot className="h-4 w-4" />
                Torna in bozza
              </button>
            </form>
          )}
        </div>
      </div>

      <GlassCard className="overflow-hidden p-5 sm:p-6">
        <LessonEditor
          lessonId={lesson.id}
          courseSlug={course.slug}
          moduleSlug={lessonModule.slug}
          lessonSlugSaved={lesson.slug}
          initial={{
            title: lesson.title,
            description: lesson.description,
            durationMin: lesson.durationMin,
            videoSourceType: lesson.videoSourceType,
            youtubeVideoId: lesson.youtubeVideoId,
            bunnyVideoId: lesson.bunnyVideoId,
            status: lesson.status,
          }}
          previewUrl={previewUrl}
        />
      </GlassCard>
    </div>
  );
}
