import { siteConfig } from '@/config/siteConfig';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import {
  buildLessonHref,
  fetchProgressSummary,
  fetchPublishedCoursesStructureForSlugs,
} from '@/lib/db/course-queries';

export type CourseStatus =
  | 'locked'
  | 'payment_pending'
  | 'owned_not_started'
  | 'owned_in_progress'
  | 'owned_completed';

export interface CourseEntitlement {
  slug: string;
  title: string;
  status: CourseStatus;
  progressPct: number;
  purchasedAt: Date | null;
  latestLessonHref: string | null;
  latestLessonSlug: string | null;
  latestModuleSlug: string | null;
  totalPublishedLessons: number;
  completedLessonsCount: number;
}

export interface EntitlementsState {
  courses: Record<string, CourseEntitlement>;
  anyAvailable: boolean;
  anyPending: boolean;
}

export const DEFAULT_ENTITLEMENT_STATE: EntitlementsState = {
  courses: {},
  anyAvailable: false,
  anyPending: false,
};

function lockedEntitlement(slug: string, title: string): CourseEntitlement {
  return {
    slug,
    title,
    status: 'locked',
    progressPct: 0,
    purchasedAt: null,
    latestLessonHref: null,
    latestLessonSlug: null,
    latestModuleSlug: null,
    totalPublishedLessons: 0,
    completedLessonsCount: 0,
  };
}

export function buildLockedEntitlements(): EntitlementsState {
  const courses: Record<string, CourseEntitlement> = {};
  for (const key of Object.keys(siteConfig.courses) as Array<
    keyof typeof siteConfig.courses
  >) {
    const cfg = siteConfig.courses[key];
    courses[cfg.slug] = lockedEntitlement(cfg.slug, cfg.title);
  }
  return { courses, anyAvailable: false, anyPending: false };
}

interface PurchaseRow {
  productSlug: string;
  purchasedAt: Date | null;
  status: 'succeeded' | 'pending';
  createdAt: Date;
}

async function resolveUserEmail(
  userId: string | undefined,
  email: string | undefined | null,
): Promise<string | null> {
  if (!isDatabaseConfigured()) return null;
  const direct = normalizeEmail(email);
  if (direct) return direct;
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { googleId: userId },
      select: { email: true },
    });
    if (user) return normalizeEmail(user.email);
  } catch {
    return null;
  }
  return null;
}

async function loadPurchases(userEmail: string): Promise<PurchaseRow[]> {
  try {
    const now = Date.now();
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    const rows = await prisma.purchase.findMany({
      where: {
        userEmail,
        OR: [
          { status: 'succeeded' },
          { status: 'pending', createdAt: { gte: new Date(now - TWO_HOURS_MS) } },
        ],
      },
      select: {
        productSlug: true,
        purchasedAt: true,
        status: true,
        createdAt: true,
      },
      orderBy: [{ purchasedAt: 'desc' }, { createdAt: 'desc' }],
    });
    return rows as PurchaseRow[];
  } catch {
    return [];
  }
}

export async function getEntitlements(
  userId?: string,
  email?: string | null,
): Promise<EntitlementsState> {
  if (!isDatabaseConfigured()) {
    return buildLockedEntitlements();
  }
  const userEmail = await resolveUserEmail(userId, email);
  const purchased = userEmail ? await loadPurchases(userEmail) : [];

  const ownedSlugs: string[] = [];
  const resolvedBySlug = new Map<
    string,
    { type: 'succeeded' | 'pending'; purchasedAt: Date | null; createdAt: Date }
  >();
  for (const p of purchased) {
    if (resolvedBySlug.has(p.productSlug)) continue;
    if (p.status === 'succeeded') {
      resolvedBySlug.set(p.productSlug, {
        type: 'succeeded',
        purchasedAt: p.purchasedAt,
        createdAt: p.createdAt,
      });
      ownedSlugs.push(p.productSlug);
    } else if (p.status === 'pending') {
      resolvedBySlug.set(p.productSlug, {
        type: 'pending',
        purchasedAt: null,
        createdAt: p.createdAt,
      });
    }
  }

  const structures = await fetchPublishedCoursesStructureForSlugs(ownedSlugs);

  const courses: Record<string, CourseEntitlement> = {};
  let anyAvailable = false;
  let anyPending = false;

  for (const key of Object.keys(siteConfig.courses) as Array<
    keyof typeof siteConfig.courses
  >) {
    const cfg = siteConfig.courses[key];
    const resolved = resolvedBySlug.get(cfg.slug);
    if (!resolved) {
      courses[cfg.slug] = lockedEntitlement(cfg.slug, cfg.title);
      continue;
    }

    if (resolved.type === 'pending') {
      anyPending = true;
      courses[cfg.slug] = {
        slug: cfg.slug,
        title: cfg.title,
        status: 'payment_pending',
        progressPct: 0,
        purchasedAt: null,
        latestLessonHref: null,
        latestLessonSlug: null,
        latestModuleSlug: null,
        totalPublishedLessons: 0,
        completedLessonsCount: 0,
      };
      continue;
    }

    anyAvailable = true;
    const struct = structures[cfg.slug];
    let progressPct = 0;
    let totalPublishedLessons = 0;
    let completedCount = 0;
    let latestLessonHref: string | null = null;
    let latestLessonSlug: string | null = null;
    let latestModuleSlug: string | null = null;

    if (struct && userEmail) {
      const summary = await fetchProgressSummary(userEmail, struct);
      progressPct = summary.progressPct;
      totalPublishedLessons = summary.totalPublished;
      completedCount = summary.completedCount;
      latestLessonSlug = summary.latestLessonSlug;
      latestModuleSlug = summary.latestModuleSlug;
      if (latestLessonSlug && latestModuleSlug) {
        latestLessonHref = buildLessonHref(cfg.slug, latestModuleSlug, latestLessonSlug);
      } else if (totalPublishedLessons === 0) {
        latestLessonHref = null;
      }
    }

    let status: CourseStatus = 'owned_not_started';
    if (totalPublishedLessons > 0 && completedCount >= totalPublishedLessons) {
      status = 'owned_completed';
    } else if (progressPct > 0 || completedCount > 0) {
      status = 'owned_in_progress';
    }

    courses[cfg.slug] = {
      slug: cfg.slug,
      title: cfg.title,
      status,
      progressPct,
      purchasedAt: resolved.purchasedAt,
      latestLessonHref,
      latestLessonSlug,
      latestModuleSlug,
      totalPublishedLessons,
      completedLessonsCount: completedCount,
    };
  }

  return { courses, anyAvailable, anyPending };
}

export function getCourseEntitlement(
  state: EntitlementsState,
  slug: string,
): CourseEntitlement | undefined {
  return state.courses[slug];
}
