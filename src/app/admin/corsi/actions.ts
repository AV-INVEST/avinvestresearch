'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ContentStatus, VideoSourceType } from '@prisma/client';
import {
  saveLessonAdmin,
  setLessonStatus,
  reorderLessonAdmin,
  createLessonAdmin,
  type AdminLessonFormValues,
} from '@/lib/admin/course-admin';

export async function actionCreateLesson(formData: FormData) {
  const moduleId = String(formData.get('moduleId') || '');
  const title = String(formData.get('title') || '');
  const courseSlug = String(formData.get('courseSlug') || '');
  const result = await createLessonAdmin(moduleId, title || undefined);
  if (courseSlug) revalidatePath(`/admin/corsi/${courseSlug}`, 'page');
  return result;
}

export async function actionPublishLesson(formData: FormData) {
  const lessonId = String(formData.get('lessonId') || '');
  const courseSlug = String(formData.get('courseSlug') || '');
  const result = await setLessonStatus(lessonId, 'PUBLISHED');
  if (courseSlug) revalidatePath(`/admin/corsi/${courseSlug}`, 'page');
  return result;
}

export async function actionUnpublishLesson(formData: FormData) {
  const lessonId = String(formData.get('lessonId') || '');
  const courseSlug = String(formData.get('courseSlug') || '');
  const result = await setLessonStatus(lessonId, 'DRAFT');
  if (courseSlug) revalidatePath(`/admin/corsi/${courseSlug}`, 'page');
  return result;
}

export async function actionReorderLesson(formData: FormData) {
  const lessonId = String(formData.get('lessonId') || '');
  const direction = String(formData.get('direction') || 'up') as 'up' | 'down';
  const courseSlug = String(formData.get('courseSlug') || '');
  const result = await reorderLessonAdmin(lessonId, direction);
  if (courseSlug) revalidatePath(`/admin/corsi/${courseSlug}`, 'page');
  return result;
}

export async function actionSaveLesson(formData: FormData) {
  const lessonId = String(formData.get('lessonId') || '');
  const courseSlug = String(formData.get('courseSlug') || '');
  const moduleSlug = String(formData.get('moduleSlug') || '');
  const lessonSlugSaved = String(formData.get('lessonSlugSaved') || '');

  const rawDur = formData.get('durationMin');
  const durationMin =
    rawDur !== undefined && rawDur !== null && String(rawDur).trim().length > 0
      ? Number(rawDur) || null
      : null;

  const values: AdminLessonFormValues = {
    title: String(formData.get('title') || ''),
    description: String(formData.get('description') || ''),
    durationMin,
    videoSourceType: (String(formData.get('videoSourceType') || 'NONE') as VideoSourceType),
    youtubeVideoId: null,
    youtubeRawUrl: String(formData.get('youtubeRawUrl') || ''),
    bunnyVideoId: String(formData.get('bunnyVideoId') || ''),
  };

  const result = await saveLessonAdmin(lessonId, values);

  if (courseSlug) {
    revalidatePath(`/admin/corsi/${courseSlug}`, 'page');
    if (moduleSlug) {
      revalidatePath(
        `/admin/corsi/${courseSlug}/lezioni/${lessonId || lessonSlugSaved}`,
        'page',
      );
      revalidatePath(`/area-membri/corsi/${courseSlug}`, 'layout');
    }
  }

  return result;
}
