import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

const THROTTLE_SEC = 15;
const COMPLETION_THRESHOLD_PCT = 95;

interface ProgressBody {
  lessonId?: unknown;
  lastPositionSec?: unknown;
  progressPct?: unknown;
}

export async function POST(req: Request) {
  try {
    const session = await auth().catch(() => null);
    if (!session?.user?.email) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }
    const userEmail = normalizeEmail(session.user.email);
    if (!userEmail) {
      return NextResponse.json({ ok: false, error: 'INVALID_EMAIL' }, { status: 401 });
    }
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: false, error: 'DB_UNAVAILABLE' }, { status: 503 });
    }

    let body: ProgressBody;
    try {
      body = (await req.json()) as ProgressBody;
    } catch {
      return NextResponse.json({ ok: false, error: 'INVALID_JSON' }, { status: 400 });
    }

    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.trim() : '';
    if (!lessonId) {
      return NextResponse.json({ ok: false, error: 'LESSON_REQUIRED' }, { status: 400 });
    }

    const lastPositionRaw =
      typeof body.lastPositionSec === 'number'
        ? body.lastPositionSec
        : typeof body.lastPositionSec === 'string'
          ? Number(body.lastPositionSec)
          : NaN;
    const progressRaw =
      typeof body.progressPct === 'number'
        ? body.progressPct
        : typeof body.progressPct === 'string'
          ? Number(body.progressPct)
          : NaN;

    const lastPositionSec = Number.isFinite(lastPositionRaw) ? Math.max(0, lastPositionRaw) : 0;
    const progressPct = Number.isFinite(progressRaw)
      ? Math.max(0, Math.min(100, progressRaw))
      : 0;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, status: true, module: { select: { course: { select: { slug: true } } } } },
    });
    if (!lesson) {
      return NextResponse.json({ ok: false, error: 'LESSON_NOT_FOUND' }, { status: 404 });
    }
    if (lesson.status !== 'PUBLISHED') {
      return NextResponse.json({ ok: false, error: 'LESSON_DRAFT' }, { status: 403 });
    }

    const existing = await prisma.lessonProgress.findUnique({
      where: { userEmail_lessonId: { userEmail, lessonId } },
      select: { updatedAt: true },
    });
    const now = new Date();
    if (existing?.updatedAt) {
      const diffSec = (now.getTime() - existing.updatedAt.getTime()) / 1000;
      if (diffSec < THROTTLE_SEC) {
        return NextResponse.json(
          { ok: true, throttled: true, retryAfter: Math.ceil(THROTTLE_SEC - diffSec) },
          { status: 200 },
        );
      }
    }

    const completed = progressPct >= COMPLETION_THRESHOLD_PCT;

    await prisma.lessonProgress.upsert({
      where: { userEmail_lessonId: { userEmail, lessonId } },
      create: {
        userEmail,
        lessonId,
        progressPct,
        lastPositionSec,
        completed,
        lastWatchedAt: now,
      },
      update: {
        progressPct,
        lastPositionSec,
        completed,
        lastWatchedAt: now,
      },
    });

    return NextResponse.json({ ok: true, completed, savedAt: now.toISOString() }, { status: 200 });
  } catch (err) {
    console.warn(
      '[api/course/progress] Failed',
      err instanceof Error ? err.message : String(err),
    );
    return NextResponse.json({ ok: false, error: 'INTERNAL' }, { status: 500 });
  }
}
