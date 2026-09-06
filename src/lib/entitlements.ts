import { siteConfig } from '@/config/siteConfig';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { normalizeEmail } from '@/lib/stripe/normalize';

export type CourseStatus = 'locked' | 'available' | 'completed';

export interface CourseEntitlement {
  slug: string;
  title: string;
  status: CourseStatus;
  progressPct: number;
  purchasedAt: Date | null;
}

export interface EntitlementsState {
  courses: Record<string, CourseEntitlement>;
  anyAvailable: boolean;
}

export const DEFAULT_ENTITLEMENT_STATE: EntitlementsState = {
  courses: {},
  anyAvailable: false,
};

export function buildLockedEntitlements(): EntitlementsState {
  const courses: Record<string, CourseEntitlement> = {};
  for (const key of Object.keys(siteConfig.courses) as Array<
    keyof typeof siteConfig.courses
  >) {
    const cfg = siteConfig.courses[key];
    courses[cfg.slug] = {
      slug: cfg.slug,
      title: cfg.title,
      status: 'locked',
      progressPct: 0,
      purchasedAt: null,
    };
  }
  return { courses, anyAvailable: false };
}

interface PurchaseRow {
  productSlug: string;
  purchasedAt: Date | null;
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
    const rows = await prisma.purchase.findMany({
      where: {
        userEmail,
        status: 'succeeded',
      },
      select: {
        productSlug: true,
        purchasedAt: true,
      },
      orderBy: { purchasedAt: 'desc' },
    });
    return rows;
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
  const purchasedBySlug = new Map<string, PurchaseRow>();
  for (const p of purchased) {
    if (!purchasedBySlug.has(p.productSlug)) {
      purchasedBySlug.set(p.productSlug, p);
    }
  }
  const courses: Record<string, CourseEntitlement> = {};
  let anyAvailable = false;
  for (const key of Object.keys(siteConfig.courses) as Array<
    keyof typeof siteConfig.courses
  >) {
    const cfg = siteConfig.courses[key];
    const purchase = purchasedBySlug.get(cfg.slug);
    const status: CourseStatus = purchase ? 'available' : 'locked';
    if (purchase) anyAvailable = true;
    courses[cfg.slug] = {
      slug: cfg.slug,
      title: cfg.title,
      status,
      progressPct: 0,
      purchasedAt: purchase?.purchasedAt ?? null,
    };
  }
  return { courses, anyAvailable };
}

export function getCourseEntitlement(
  state: EntitlementsState,
  slug: string,
): CourseEntitlement | undefined {
  return state.courses[slug];
}
