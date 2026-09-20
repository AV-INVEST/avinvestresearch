import { prisma } from '@/lib/db/prisma';

export interface RateLimitRule {
  scope: string;
  resourceKey: string;
  windowSizeMinutes: number;
  maxCount: number;
  description?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number | null;
  blockedBy: RateLimitRule | null;
  maxForBlockedRule: number | null;
}

function computeWindowStart(now: Date, windowSizeMinutes: number): Date {
  const ms = now.getTime();
  const windowMs = windowSizeMinutes * 60 * 1000;
  const startMs = Math.floor(ms / windowMs) * windowMs;
  return new Date(startMs);
}

const CLEANUP_PROBABILITY = 0.02;

async function opportunisticCleanup(): Promise<void> {
  try {
    if (Math.random() > CLEANUP_PROBABILITY) return;
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    await prisma.downloadRateLimitBucket.deleteMany({
      where: { windowStart: { lt: cutoff } },
    });
  } catch {
  }
}

export async function checkAndConsumeDownload(
  userEmail: string,
  rules: RateLimitRule[],
): Promise<RateLimitResult> {
  if (!userEmail || rules.length === 0) {
    return { allowed: true, retryAfterSeconds: null, blockedBy: null, maxForBlockedRule: null };
  }

  const now = new Date();
  const promises: Promise<{ rule: RateLimitRule; newCount: number; windowStart: Date }>[] = [];

  for (const rule of rules) {
    const windowStart = computeWindowStart(now, rule.windowSizeMinutes);
    const promise = prisma.downloadRateLimitBucket
      .upsert({
        where: {
          RateLimitBucket_unique_key: {
            userEmail,
            scope: rule.scope,
            resourceKey: rule.resourceKey,
            windowStart,
            windowSizeMinutes: rule.windowSizeMinutes,
          },
        },
        update: { count: { increment: 1 } },
        create: {
          userEmail,
          scope: rule.scope,
          resourceKey: rule.resourceKey,
          windowStart,
          windowSizeMinutes: rule.windowSizeMinutes,
          count: 1,
        },
        select: { count: true, windowStart: true },
      })
      .then((rec) => ({
        rule,
        newCount: rec.count,
        windowStart: rec.windowStart,
      }));
    promises.push(promise);
  }

  const results = await Promise.all(promises);

  void opportunisticCleanup();

  let blockedResult: RateLimitResult = {
    allowed: true,
    retryAfterSeconds: null,
    blockedBy: null,
    maxForBlockedRule: null,
  };
  let longestRetry = 0;
  let blockedRule: RateLimitRule | null = null;
  let blockedMax: number | null = null;

  for (const res of results) {
    if (res.newCount > res.rule.maxCount) {
      const windowEnd = new Date(
        res.windowStart.getTime() + res.rule.windowSizeMinutes * 60 * 1000,
      );
      const retrySecs = Math.max(1, Math.ceil((windowEnd.getTime() - now.getTime()) / 1000));
      if (retrySecs > longestRetry) {
        longestRetry = retrySecs;
        blockedRule = res.rule;
        blockedMax = res.rule.maxCount;
      }
    }
  }

  if (blockedRule) {
    blockedResult = {
      allowed: false,
      retryAfterSeconds: longestRetry,
      blockedBy: blockedRule,
      maxForBlockedRule: blockedMax,
    };
  }

  return blockedResult;
}
