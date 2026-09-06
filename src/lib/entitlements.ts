import { siteConfig } from '@/config/siteConfig';

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

export async function getEntitlements(
  _userId?: string,
): Promise<EntitlementsState> {
  return buildLockedEntitlements();
}

export function getCourseEntitlement(
  state: EntitlementsState,
  slug: string,
): CourseEntitlement | undefined {
  return state.courses[slug];
}
