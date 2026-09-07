'use server';

import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import type { ContentStatus, VideoSourceType, Prisma } from '@prisma/client';
const SORT_ASC: Prisma.SortOrder = 'asc';
const SORT_DESC: Prisma.SortOrder = 'desc';
import { siteConfig } from '@/config/siteConfig';

const YOUTUBE_ID_REGEX =
  /^(?:https?:\/\/)?(?:(?:www|m|music)\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export interface AdminLessonFormValues {
  title: string;
  description: string;
  durationMin?: number | null;
  videoSourceType: VideoSourceType;
  youtubeVideoId?: string | null;
  youtubeRawUrl?: string | null;
  bunnyVideoId?: string | null;
}

export interface AdminActionResult {
  ok: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

export interface ExtractYouTubeResult {
  ok: boolean;
  videoId?: string | null;
  warning?: string | null;
  error?: string;
}

export async function requireAdmin(): Promise<{ ok: boolean; error?: string }> {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user?.email) {
      return { ok: false, error: 'Autenticazione richiesta.' };
    }
    if (!isAdminSession(session as any)) {
      return { ok: false, error: 'Accesso non autorizzato.' };
    }
    if (!isDatabaseConfigured()) {
      return { ok: false, error: 'Database non configurato.' };
    }
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore autorizzazione.',
    };
  }
}

function extractYouTubeVideoId(raw: unknown): ExtractYouTubeResult {
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, videoId: null, warning: null };
  }
  if (typeof raw !== 'string') {
    return { ok: false, error: 'URL YouTube non valida.' };
  }
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, videoId: null, warning: null };
  }
  const match = trimmed.match(YOUTUBE_ID_REGEX);
  if (match && match[1]) {
    const id = match[1];
    return {
      ok: true,
      videoId: id,
      warning:
        'YouTube mostrera il proprio marchio, i controlli del player e i consigli al termine. Non e possibile bloccare la condivisione o nascondere il branding ufficiale.',
    };
  }
  if (/^[A-Za-z0-9_-]{6,}$/.test(trimmed)) {
    return {
      ok: true,
      videoId: trimmed,
      warning:
        'YouTube mostrera il proprio marchio, i controlli del player e i consigli al termine. Non e possibile bloccare la condivisione o nascondere il branding ufficiale.',
    };
  }
  return {
    ok: false,
    error:
      'URL YouTube non riconosciuta. Usa un link valido tipo https://youtu.be/xxx o https://www.youtube.com/watch?v=xxx.',
  };
}

export async function ensureAdminCoursesBootstrap(): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    const desired = Object.values(siteConfig.courses).map((c) => ({
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle ?? null,
      description: c.description ?? null,
    }));

    const nowOrder: Record<string, number> = {
      foundations: 0,
      'trading-lab': 1,
    };

    for (const c of desired) {
      await prisma.course.upsert({
        where: { slug: c.slug },
        create: {
          slug: c.slug,
          title: c.title,
          subtitle: c.subtitle ?? undefined,
          description: c.description ?? undefined,
          order: nowOrder[c.slug] ?? 0,
        },
        update: {
          title: c.title,
        },
        select: { id: true },
      });
    }

    const foundationsCourse = await prisma.course.findUnique({
      where: { slug: 'foundations' },
      select: { id: true },
    });
    if (foundationsCourse) {
      await prisma.module.upsert({
        where: {
          courseId_slug: {
            courseId: foundationsCourse.id,
            slug: 'fondamenti-di-analisi-tecnica',
          },
        },
        create: {
          courseId: foundationsCourse.id,
          slug: 'fondamenti-di-analisi-tecnica',
          title: 'Fondamenti di analisi tecnica',
          description:
            'Il percorso base AV Foundations: 10 lezioni per costruire le basi operative.',
          order: 0,
        },
        update: {},
        select: { id: true },
      });
    }

    return { ok: true, message: 'Corsi e moduli base assicurati.' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore bootstrap corsi.',
    };
  }
}

export async function listAdminCourses() {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error, courses: [] };
  try {
    const courses = await prisma.course.findMany({
      orderBy: [{ order: SORT_ASC }, { title: SORT_ASC }],
      include: {
        modules: {
          orderBy: [{ order: SORT_ASC }, { title: SORT_ASC }],
          include: {
            lessons: {
              orderBy: [{ order: SORT_ASC }, { createdAt: SORT_ASC }],
              select: {
                id: true,
                slug: true,
                title: true,
                status: true,
                durationMin: true,
                videoSourceType: true,
                order: true,
              },
            },
          },
        },
      },
    });
    return { ok: true, courses };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore caricamento corsi.',
      courses: [],
    };
  }
}

export async function getAdminLessonDetail(lessonId: string) {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error, lesson: null };
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: { select: { id: true, slug: true, title: true } },
          },
        },
      },
    });
    if (!lesson) return { ok: false, error: 'Lezione non trovata.', lesson: null };
    return { ok: true, lesson };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore caricamento lezione.',
      lesson: null,
    };
  }
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function saveLessonAdmin(
  lessonId: string,
  values: AdminLessonFormValues,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  try {
    const title = (values.title || '').trim();
    if (title.length === 0) {
      return { ok: false, error: 'Il titolo non puo essere vuoto.' };
    }

    const youtube =
      values.videoSourceType === 'YOUTUBE'
        ? extractYouTubeVideoId(values.youtubeRawUrl || values.youtubeVideoId)
        : { ok: true, videoId: null as string | null, warning: null as string | null };

    if (!youtube.ok) {
      return { ok: false, error: youtube.error || 'URL YouTube non valida.' };
    }

    const videoSourceType: VideoSourceType = values.videoSourceType || 'NONE';
    const youtubeVideoId =
      videoSourceType === 'YOUTUBE' ? youtube.videoId || null : null;
    const bunnyVideoId =
      videoSourceType === 'BUNNY_STREAM'
        ? (values.bunnyVideoId || '').trim() || null
        : null;

    const slug = slugify(title);
    if (!slug) return { ok: false, error: 'Impossibile generare slug dal titolo.' };

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title,
        description: (values.description || '').trim() || null,
        durationMin:
          typeof values.durationMin === 'number' && values.durationMin > 0
            ? values.durationMin
            : null,
        videoSourceType,
        youtubeVideoId,
        bunnyVideoId,
        slug,
      },
      select: { id: true },
    });

    return {
      ok: true,
      message: 'Modifiche salvate.',
      data: { youtubeWarning: youtube.warning || null },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore salvataggio lezione.',
    };
  }
}

export async function setLessonStatus(
  lessonId: string,
  status: ContentStatus,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { status },
      select: { id: true },
    });
    return {
      ok: true,
      message: status === 'PUBLISHED' ? 'Lezione pubblicata.' : 'Lezione impostata come bozza.',
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error ? err.message : 'Errore aggiornamento stato lezione.',
    };
  }
}

export async function createLessonAdmin(
  moduleId: string,
  titleInput?: string,
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    const moduleRow = await prisma.module.findUnique({
      where: { id: moduleId },
      select: { id: true },
    });
    if (!moduleRow) return { ok: false, error: 'Modulo non trovato.' };

    const maxOrder = await prisma.lesson.aggregate({
      where: { moduleId },
      _max: { order: true },
    });
    const nextOrder = (maxOrder._max.order ?? -1) + 1;

    const baseTitle = titleInput && titleInput.trim().length > 0
      ? titleInput.trim()
      : `Nuova lezione ${nextOrder + 1}`;
    const slug = slugify(baseTitle);

    const created = await prisma.lesson.create({
      data: {
        moduleId,
        slug,
        title: baseTitle,
        description: null,
        durationMin: null,
        videoSourceType: 'NONE',
        youtubeVideoId: null,
        bunnyVideoId: null,
        status: 'DRAFT',
        order: nextOrder,
      },
      select: { id: true, slug: true, module: { select: { course: { select: { slug: true } } } } },
    });

    return { ok: true, message: 'Lezione creata in bozza.', data: { lessonId: created.id } };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore creazione lezione.',
    };
  }
}

export async function reorderLessonAdmin(
  lessonId: string,
  direction: 'up' | 'down',
): Promise<AdminActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, moduleId: true, order: true },
    });
    if (!lesson) return { ok: false, error: 'Lezione non trovata.' };

    const whereAdj =
      direction === 'up'
        ? { moduleId: lesson.moduleId, order: { lt: lesson.order } }
        : { moduleId: lesson.moduleId, order: { gt: lesson.order } };
    const orderAdj = direction === 'up' ? { order: SORT_DESC } : { order: SORT_ASC };

    const adjacent = await prisma.lesson.findFirst({
      where: whereAdj,
      orderBy: orderAdj,
      select: { id: true, order: true },
    });
    if (!adjacent) return { ok: false, error: 'Impossibile riordinare oltre questo punto.' };

    await prisma.$transaction([
      prisma.lesson.update({ where: { id: lesson.id }, data: { order: adjacent.order } }),
      prisma.lesson.update({ where: { id: adjacent.id }, data: { order: lesson.order } }),
    ]);

    return { ok: true, message: direction === 'up' ? 'Sposta su eseguito.' : 'Sposta giu eseguito.' };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Errore riordino.',
    };
  }
}
