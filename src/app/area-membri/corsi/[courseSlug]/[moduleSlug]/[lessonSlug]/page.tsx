import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { getEntitlements } from '@/lib/entitlements';
import {
  fetchFullCourseStructure,
  buildLessonHref,
  flattenFullLessons,
  resolveLessonNavigation,
  fetchProgressSummary,
  fetchCompletedLessonIds,
  type FullCourseStructure,
  type FullLesson,
  type FullModule,
  type FlatFullLesson,
} from '@/lib/db/course-queries';
import GlassCard from '@/components/ui/GlassCard';
import LessonViewer from '@/components/members/LessonViewer';
import type { ContentStatus, VideoSourceType } from '@prisma/client';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

interface LegacyViewerLesson {
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

interface LegacyViewerModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
}

interface LegacyViewerCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
}

async function loadResumePosition(
  userEmail: string,
  lessonId: string,
): Promise<number | null> {
  if (!isDatabaseConfigured() || !userEmail || !lessonId) return null;
  try {
    const row = await prisma.lessonProgress.findUnique({
      where: {
        userEmail_lessonId: { userEmail, lessonId },
      },
      select: { lastPositionSec: true },
    });
    if (row && typeof row.lastPositionSec === 'number' && row.lastPositionSec > 5) {
      return Math.floor(row.lastPositionSec);
    }
    return null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const p = await params;
  return {
    title: 'Lezione',
    description: 'Lezione del percorso formativo in AV-INVEST Research.',
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const p = await params;
  const sp = await searchParams;
  const isPreviewRequest = sp.preview === '1';

  const session = await auth().catch(() => null);
  if (!session?.user) {
    const path =
      `/area-membri/corsi/${encodeURIComponent(p.courseSlug)}/${encodeURIComponent(p.moduleSlug)}/${encodeURIComponent(p.lessonSlug)}`;
    redirect('/login?callbackUrl=' + encodeURIComponent(path));
  }

  const isAdmin = isAdminSession(session as any);
  const allowPreview = isAdmin && isPreviewRequest;

  const entitlements = await getEntitlements(session.user.id, session.user.email);
  const ent = entitlements.courses[p.courseSlug];
  const entStatus = ent?.status ?? 'locked';
  const owned =
    entStatus === 'owned_not_started' ||
    entStatus === 'owned_in_progress' ||
    entStatus === 'owned_completed';
  const courseLocked = !(owned || allowPreview);

  const includeDrafts = allowPreview;
  const structure: FullCourseStructure | null = await fetchFullCourseStructure(
    p.courseSlug,
    { includeDrafts },
  );
  if (!structure) notFound();

  const userEmail = normalizeEmail(session.user.email) || '';

  const lessonModule = structure.modules.find((m) => m.slug === p.moduleSlug);
  if (!lessonModule) notFound();
  const lesson = lessonModule.lessons.find((l) => l.slug === p.lessonSlug);
  if (!lesson) notFound();

  const flat: FlatFullLesson[] = flattenFullLessons(structure, { includeDrafts });
  const nav = resolveLessonNavigation(flat, p.moduleSlug, p.lessonSlug);

  let progressPct = 0;
  let completedCount = 0;
  let completedLessonIdsArr: string[] = [];
  if (!courseLocked && userEmail) {
    const summary = await fetchProgressSummary(
      userEmail,
      (structure as unknown) as any,
    );
    progressPct = summary.progressPct;
    completedCount = summary.completedCount;
    const flatIds = flat.map((l) => l.lessonId);
    const completedSet = await fetchCompletedLessonIds(userEmail, flatIds);
    completedLessonIdsArr = Array.from(completedSet);
  }

  const resumeStartSec = owned && !courseLocked && userEmail
    ? await loadResumePosition(userEmail, lesson.id)
    : null;

  const viewerLesson: LegacyViewerLesson = {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    durationMin: lesson.durationMin,
    youtubeId: lesson.youtubeVideoId,
    videoSourceType: lesson.videoSourceType,
    youtubeVideoId: lesson.youtubeVideoId,
    bunnyVideoId: lesson.bunnyVideoId,
    status: lesson.status,
  };

  const viewerModule: LegacyViewerModule = {
    id: lessonModule.id,
    slug: lessonModule.slug,
    title: lessonModule.title,
    description: lessonModule.description,
  };

  const viewerCourse: LegacyViewerCourse = {
    id: structure.id,
    slug: structure.slug,
    title: structure.title,
    subtitle: structure.subtitle,
    description: structure.description,
  };

  const prev = nav?.prev
    ? {
        label: nav.prev.title,
        href: buildLessonHref(p.courseSlug, nav.prev.moduleSlug, nav.prev.lessonSlug),
      }
    : undefined;

  const next = nav?.next
    ? {
        label: nav.next.title,
        href: buildLessonHref(p.courseSlug, nav.next.moduleSlug, nav.next.lessonSlug),
      }
    : undefined;

  const lessonNumber = nav ? nav.index + 1 : 0;
  const totalLessons = nav ? nav.total : flat.length;

  return (
    <LessonViewer
      course={viewerCourse as any}
      courseLocked={courseLocked}
      module={viewerModule as any}
      lesson={viewerLesson as any}
      prev={prev}
      next={next}
      progressPct={progressPct}
      completedCount={completedCount}
      lessonNumber={lessonNumber}
      totalLessons={totalLessons}
      isPreview={allowPreview}
      resumeStartSec={resumeStartSec ?? undefined}
      lessonsFlat={flat}
      completedLessonIds={completedLessonIdsArr}
    />
  );
}
