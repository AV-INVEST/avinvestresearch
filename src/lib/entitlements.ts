import type { Subscription } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';
import {
  buildLessonHref,
  fetchProgressSummary,
  fetchPublishedCoursesStructureForSlugs,
} from '@/lib/db/course-queries';

export type ResearchClubStatus =
  | 'none'
  | 'active'
  | 'cancel_at_period_end'
  | 'payment_problem'
  | 'ended';

export interface ResearchClubEntitlement {
  status: ResearchClubStatus;
  accessGranted: boolean;
  message: string;
  nextDate: Date | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscription: Subscription | null;
}

const RESEARCH_CLUB_DEFAULT: ResearchClubEntitlement = {
  status: 'none',
  accessGranted: false,
  message: 'Nessun abbonamento AV Research Club attivo.',
  nextDate: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscription: null,
};

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
  researchClub: ResearchClubEntitlement;
}

export const DEFAULT_ENTITLEMENT_STATE: EntitlementsState = {
  courses: {},
  anyAvailable: false,
  anyPending: false,
  researchClub: RESEARCH_CLUB_DEFAULT,
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
  return { courses, anyAvailable: false, anyPending: false, researchClub: RESEARCH_CLUB_DEFAULT };
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

async function loadResearchClubSubscription(userEmail: string): Promise<Subscription | null> {
  try {
    const row = await prisma.subscription.findFirst({
      where: {
        userEmail,
        product: 'AV_RESEARCH_CLUB',
      },
      orderBy: { updatedAt: 'desc' },
    });
    return row;
  } catch {
    return null;
  }
}

export function researchClubEntitlementFromSubscription(
  sub: Subscription | null,
): ResearchClubEntitlement {
  if (!sub) return RESEARCH_CLUB_DEFAULT;
  const now = new Date();
  const periodEnd = sub.currentPeriodEnd ?? null;
  const withinPeriod = periodEnd ? periodEnd.getTime() > now.getTime() : false;
  const paymentProblem = sub.paymentProblem === true;
  const status = sub.status;

  if (status === 'ENDED') {
    return {
      status: 'ended',
      accessGranted: false,
      message: 'Abbonamento terminato. Rinnova per continuare ad accedere alle ricerche.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (sub.cancelAtPeriodEnd) {
    return {
      status: 'cancel_at_period_end',
      accessGranted: withinPeriod,
      message: withinPeriod
        ? 'Rinnovo automatico disattivato. L\u2019accesso resta attivo fino alla fine del periodo pagato.'
        : 'Periodo pagato concluso.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (paymentProblem) {
    return {
      status: 'payment_problem',
      accessGranted: withinPeriod,
      message: withinPeriod
        ? 'Problema con l\u2019ultimo pagamento. Aggiorna il metodo di pagamento per mantenere l\u2019accesso.'
        : 'Accesso sospeso per problemi di pagamento.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (status === 'ACTIVE' || status === 'TRIALING') {
    return {
      status: 'active',
      accessGranted: true,
      message: 'Abbonamento attivo.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (status === 'PAST_DUE') {
    return {
      status: 'payment_problem',
      accessGranted: withinPeriod,
      message: withinPeriod
        ? 'Pagamento in ritardo. Mantieni il metodo di pagamento aggiornato per non perdere l\u2019accesso.'
        : 'Accesso sospeso per pagamento in ritardo.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (status === 'CANCELED') {
    return {
      status: withinPeriod ? 'cancel_at_period_end' : 'ended',
      accessGranted: withinPeriod,
      message: withinPeriod
        ? 'Rinnovo automatico disattivato. L\u2019accesso resta attivo fino alla fine del periodo pagato.'
        : 'Abbonamento terminato.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  if (status === 'INCOMPLETE') {
    return {
      status: 'payment_problem',
      accessGranted: false,
      message: 'Pagamento non completato. Completa l\u2019acquisto per attivare l\u2019abbonamento.',
      nextDate: periodEnd,
      stripeCustomerId: sub.stripeCustomerId ?? null,
      stripeSubscriptionId: sub.stripeSubscriptionId ?? null,
      subscription: sub,
    };
  }

  return RESEARCH_CLUB_DEFAULT;
}

export async function getResearchClubEntitlement(
  userId?: string,
  email?: string | null,
): Promise<ResearchClubEntitlement> {
  if (!isDatabaseConfigured()) return RESEARCH_CLUB_DEFAULT;
  const userEmail = await resolveUserEmail(userId, email);
  if (!userEmail) return RESEARCH_CLUB_DEFAULT;
  const sub = await loadResearchClubSubscription(userEmail);
  return researchClubEntitlementFromSubscription(sub);
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

  const researchClubSub = userEmail ? await loadResearchClubSubscription(userEmail) : null;
  const researchClub = researchClubEntitlementFromSubscription(researchClubSub);

  return { courses, anyAvailable, anyPending, researchClub };
}

export function getCourseEntitlement(
  state: EntitlementsState,
  slug: string,
): CourseEntitlement | undefined {
  return state.courses[slug];
}
