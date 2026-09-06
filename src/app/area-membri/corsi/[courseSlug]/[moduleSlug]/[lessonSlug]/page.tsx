import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  COURSES,
  getCourseBySlug,
  resolveLesson,
  type Course,
  type Lesson,
  type Module,
} from '@/data/courses';
import { getEntitlements } from '@/lib/entitlements';
import LessonViewer from '@/components/members/LessonViewer';

export const dynamic = 'force-dynamic';

interface LessonFlat {
  courseSlug: string;
  moduleSlug: string;
  lessonSlug: string;
  title: string;
}

function flattenLessons(courses: Course[]): LessonFlat[] {
  const out: LessonFlat[] = [];
  for (const c of courses) {
    for (const m of c.modules) {
      for (const l of m.lessons) {
        out.push({
          courseSlug: c.slug,
          moduleSlug: m.slug,
          lessonSlug: l.slug,
          title: l.title,
        });
      }
    }
  }
  return out;
}

function buildLessonHref(item: LessonFlat): string {
  return `/area-membri/corsi/${encodeURIComponent(item.courseSlug)}/${encodeURIComponent(item.moduleSlug)}/${encodeURIComponent(item.lessonSlug)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const p = await params;
  const course = getCourseBySlug(p.courseSlug);
  const titleBase = course ? `${course.title} - Lezione` : 'Lezione';
  return {
    title: titleBase,
    description:
      'Lezione del percorso formativo nell\'area membri di AV-INVEST Research.',
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const session = await auth().catch(() => null);
  const p = await params;
  if (!session?.user) {
    const path =
      '/area-membri/corsi/' +
      encodeURIComponent(p.courseSlug) +
      '/' +
      encodeURIComponent(p.moduleSlug) +
      '/' +
      encodeURIComponent(p.lessonSlug);
    const target = '/login?callbackUrl=' + encodeURIComponent(path);
    redirect(target);
  }

  const course = getCourseBySlug(p.courseSlug);
  if (!course) notFound();

  const resolved = resolveLesson(course, p.moduleSlug, p.lessonSlug);
  if (!resolved) notFound();
  const { module, lesson }: { module: Module; lesson: Lesson } = resolved;

  const entitlements = await getEntitlements(session.user.id);
  const ent = entitlements.courses[course.slug];
  const courseLocked = !ent || ent.status === 'locked';

  const flat = flattenLessons(COURSES);
  const idx = flat.findIndex(
    (x) =>
      x.courseSlug === course.slug &&
      x.moduleSlug === module.slug &&
      x.lessonSlug === lesson.slug,
  );
  const prevItem = idx > 0 ? flat[idx - 1] : undefined;
  const nextItem = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : undefined;

  return (
    <LessonViewer
      course={course}
      courseLocked={courseLocked}
      module={module}
      lesson={lesson}
      prev={
        prevItem
          ? { label: prevItem.title, href: buildLessonHref(prevItem) }
          : undefined
      }
      next={
        nextItem
          ? { label: nextItem.title, href: buildLessonHref(nextItem) }
          : undefined
      }
    />
  );
}
