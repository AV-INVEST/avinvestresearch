import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { ContentStatus, VideoSourceType } from '@prisma/client';

export interface PublishedCourseStructure {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  modules: Array<{
    id: string;
    slug: string;
    title: string;
    order: number;
    lessons: Array<{
      id: string;
      slug: string;
      title: string;
      order: number;
      status: ContentStatus;
    }>;
  }>;
}

interface FlatPublishedLesson {
  lessonId: string;
  lessonSlug: string;
  moduleSlug: string;
  courseSlug: string;
  order: number;
  moduleOrder: number;
  title: string;
  status: ContentStatus;
}

export interface FullLesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  durationMin: number | null;
  videoSourceType: VideoSourceType;
  youtubeVideoId: string | null;
  bunnyVideoId: string | null;
  status: ContentStatus;
  order: number;
  moduleId: string;
}

export interface FullModule {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  order: number;
  lessons: FullLesson[];
}

export interface FullCourseStructure {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  modules: FullModule[];
}

export interface FlatFullLesson {
  lessonId: string;
  lessonSlug: string;
  moduleId: string;
  moduleSlug: string;
  courseSlug: string;
  moduleOrder: number;
  lessonOrder: number;
  title: string;
  status: ContentStatus;
}

export interface LessonNavigation {
  prev: FlatFullLesson | null;
  next: FlatFullLesson | null;
  index: number;
  total: number;
}

export function buildLessonHref(courseSlug: string, moduleSlug: string, lessonSlug: string): string {
  return `/area-membri/corsi/${encodeURIComponent(courseSlug)}/${encodeURIComponent(moduleSlug)}/${encodeURIComponent(lessonSlug)}`;
}

export function flattenPublishedLessons(struct: PublishedCourseStructure): FlatPublishedLesson[] {
  const out: FlatPublishedLesson[] = [];
  for (const m of struct.modules) {
    for (const l of m.lessons) {
      if (l.status !== 'PUBLISHED') continue;
      out.push({
        lessonId: l.id,
        lessonSlug: l.slug,
        moduleSlug: m.slug,
        courseSlug: struct.courseSlug,
        order: l.order,
        moduleOrder: m.order,
        title: l.title,
        status: l.status,
      });
    }
  }
  out.sort((a, b) => a.moduleOrder - b.moduleOrder || a.order - b.order);
  return out;
}

export async function fetchPublishedCoursesStructureForSlugs(
  courseSlugs: string[],
): Promise<Record<string, PublishedCourseStructure>> {
  if (!isDatabaseConfigured() || courseSlugs.length === 0) return {};
  try {
    const courses = await prisma.course.findMany({
      where: { slug: { in: courseSlugs } },
      include: {
        modules: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            lessons: {
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              select: {
                id: true,
                slug: true,
                title: true,
                order: true,
                status: true,
              },
            },
          },
        },
      },
    });
    const out: Record<string, PublishedCourseStructure> = {};
    for (const c of courses) {
      out[c.slug] = {
        courseId: c.id,
        courseSlug: c.slug,
        courseTitle: c.title,
        modules: c.modules.map((m) => ({
          id: m.id,
          slug: m.slug,
          title: m.title,
          order: m.order,
          lessons: m.lessons,
        })),
      };
    }
    return out;
  } catch (err) {
    console.warn('[course-queries] Failed fetchPublishedCoursesStructureForSlugs', err instanceof Error ? err.message : String(err));
    return {};
  }
}

export async function fetchFullCourseStructure(
  courseSlug: string,
  opts: { includeDrafts?: boolean } = {},
): Promise<FullCourseStructure | null> {
  if (!isDatabaseConfigured()) return null;
  const { includeDrafts = false } = opts;
  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        modules: {
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          include: {
            lessons: {
              orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    });
    if (!course) return null;
    const modules: FullModule[] = course.modules.map((m) => {
      const lessons = includeDrafts
        ? m.lessons
        : m.lessons.filter((l) => l.status === 'PUBLISHED');
      return {
        id: m.id,
        slug: m.slug,
        title: m.title,
        description: m.description,
        order: m.order,
        lessons: lessons as unknown as FullLesson[],
      };
    });
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      modules,
    };
  } catch (err) {
    console.warn('[course-queries] Failed fetchFullCourseStructure', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export function flattenFullLessons(
  struct: FullCourseStructure,
  opts: { includeDrafts?: boolean } = {},
): FlatFullLesson[] {
  const out: FlatFullLesson[] = [];
  const includeDrafts = opts.includeDrafts ?? false;
  for (const m of struct.modules) {
    for (const l of m.lessons) {
      if (!includeDrafts && l.status !== 'PUBLISHED') continue;
      out.push({
        lessonId: l.id,
        lessonSlug: l.slug,
        moduleId: m.id,
        moduleSlug: m.slug,
        courseSlug: struct.slug,
        moduleOrder: m.order,
        lessonOrder: l.order,
        title: l.title,
        status: l.status,
      });
    }
  }
  out.sort((a, b) => a.moduleOrder - b.moduleOrder || a.lessonOrder - b.lessonOrder);
  return out;
}

export function resolveLessonNavigation(
  flat: FlatFullLesson[],
  moduleSlug: string,
  lessonSlug: string,
): LessonNavigation | null {
  const idx = flat.findIndex(
    (l) => l.moduleSlug === moduleSlug && l.lessonSlug === lessonSlug,
  );
  if (idx < 0) return null;
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx + 1 < flat.length ? flat[idx + 1] : null,
    index: idx,
    total: flat.length,
  };
}

export function findFirstAccessibleLesson(
  struct: FullCourseStructure,
  opts: { includeDrafts?: boolean } = {},
): { moduleSlug: string; lessonSlug: string } | null {
  const flat = flattenFullLessons(struct, opts);
  if (flat.length === 0) return null;
  const first = flat[0];
  return { moduleSlug: first.moduleSlug, lessonSlug: first.lessonSlug };
}

export interface ProgressSummary {
  progressPct: number;
  completedCount: number;
  totalPublished: number;
  latestLessonId: string | null;
  latestLessonSlug: string | null;
  latestModuleSlug: string | null;
}

export async function fetchCompletedLessonIds(
  userEmail: string,
  lessonIds: string[],
): Promise<Set<string>> {
  const empty = new Set<string>();
  if (!isDatabaseConfigured() || !userEmail || lessonIds.length === 0) return empty;
  try {
    const rows = await prisma.lessonProgress.findMany({
      where: { userEmail, lessonId: { in: lessonIds }, completed: true },
      select: { lessonId: true },
    });
    return new Set(rows.map((r) => r.lessonId));
  } catch (err) {
    console.warn('[course-queries] Failed fetchCompletedLessonIds', err instanceof Error ? err.message : String(err));
    return empty;
  }
}

export async function fetchProgressSummary(
  userEmail: string,
  structure: PublishedCourseStructure,
): Promise<ProgressSummary> {
  const flat = flattenPublishedLessons(structure);
  const totalPublished = flat.length;
  const empty: ProgressSummary = {
    progressPct: 0,
    completedCount: 0,
    totalPublished,
    latestLessonId: null,
    latestLessonSlug: null,
    latestModuleSlug: null,
  };
  if (totalPublished === 0) return empty;
  if (!isDatabaseConfigured()) return empty;

  const lessonIds = flat.map((l) => l.lessonId);
  try {
    const rows = await prisma.lessonProgress.findMany({
      where: { userEmail, lessonId: { in: lessonIds } },
      select: {
        lessonId: true,
        completed: true,
        progressPct: true,
        lastWatchedAt: true,
      },
    });
    const byId = new Map(rows.map((r) => [r.lessonId, r]));
    let completedCount = 0;
    let lastByTime: { lessonId: string; t: number } | null = null;
    let firstIncompleteIndex = -1;
    let progressSum = 0;
    for (let i = 0; i < flat.length; i++) {
      const l = flat[i];
      const row = byId.get(l.lessonId);
      if (row) {
        progressSum += Math.max(0, Math.min(100, row.progressPct ?? 0));
        if (row.completed) completedCount++;
        if (row.lastWatchedAt) {
          const t = row.lastWatchedAt.getTime();
          if (!lastByTime || t > lastByTime.t) {
            lastByTime = { lessonId: l.lessonId, t };
          }
        }
      }
      if (firstIncompleteIndex === -1 && !(row && row.completed)) {
        firstIncompleteIndex = i;
      }
    }
    const progressPct = Math.round(progressSum / totalPublished);
    let latestIdx = firstIncompleteIndex;
    if (lastByTime) {
      const idx = flat.findIndex((l) => l.lessonId === lastByTime!.lessonId);
      if (idx >= 0) latestIdx = idx;
    }
    if (latestIdx === -1) latestIdx = 0;
    if (latestIdx >= flat.length) latestIdx = flat.length - 1;
    const latest = flat[latestIdx] ?? null;
    return {
      progressPct: Math.max(0, Math.min(100, progressPct)),
      completedCount,
      totalPublished,
      latestLessonId: latest?.lessonId ?? null,
      latestLessonSlug: latest?.lessonSlug ?? null,
      latestModuleSlug: latest?.moduleSlug ?? null,
    };
  } catch (err) {
    console.warn('[course-queries] Failed fetchProgressSummary', err instanceof Error ? err.message : String(err));
    return empty;
  }
}
