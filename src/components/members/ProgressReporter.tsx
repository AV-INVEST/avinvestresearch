'use client';

import { useEffect, useRef } from 'react';

interface Props {
  lessonId: string;
  enabled?: boolean;
  startSec?: number;
  durationSec?: number;
}

export default function ProgressReporter({
  lessonId,
  enabled = true,
  startSec = 0,
  durationSec,
}: Props) {
  const mountedAtRef = useRef<number | null>(null);
  const lastSentRef = useRef<{ pos: number; pct: number; at: number } | null>(null);
  const pendingSendRef = useRef<number | null>(null);

  useEffect(() => {
    mountedAtRef.current = Date.now();
    lastSentRef.current = null;
    if (!enabled || !lessonId) return;

    const computeEstimate = () => {
      const elapsedSec = mountedAtRef.current
        ? Math.max(0, (Date.now() - mountedAtRef.current) / 1000)
        : 0;
      const estPos = Math.max(0, (startSec || 0) + elapsedSec);
      const clampedPos =
        typeof durationSec === 'number' && durationSec > 0
          ? Math.min(estPos, durationSec)
          : estPos;
      const pct =
        typeof durationSec === 'number' && durationSec > 0
          ? Math.max(0, Math.min(100, (clampedPos / durationSec) * 100))
          : null;
      return { pos: clampedPos, pct };
    };

    const sendReport = async (force: boolean) => {
      if (pendingSendRef.current) return;
      const { pos, pct } = computeEstimate();
      const now = Date.now();
      if (!force && lastSentRef.current) {
        const delta = now - lastSentRef.current.at;
        if (delta < 10 * 1000) return;
      }
      try {
        pendingSendRef.current = now;
        const res = await fetch('/api/course/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            lessonId,
            lastPositionSec: Math.floor(pos),
            progressPct: typeof pct === 'number' ? Math.round(pct) : null,
          }),
        });
        if (res.ok) {
          lastSentRef.current = { pos, pct: pct ?? 0, at: now };
        }
      } catch {
      } finally {
        pendingSendRef.current = null;
      }
    };

    const interval = window.setInterval(() => {
      sendReport(false);
    }, 5000);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        sendReport(true);
      }
    };
    const onBeforeUnload = () => {
      try {
        const { pos, pct } = computeEstimate();
        const body = JSON.stringify({
          lessonId,
          lastPositionSec: Math.floor(pos),
          progressPct: typeof pct === 'number' ? Math.round(pct) : null,
        });
        if ('sendBeacon' in navigator) {
          navigator.sendBeacon('/api/course/progress', body);
        }
      } catch {}
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', onBeforeUnload);

    const initial = window.setTimeout(() => sendReport(false), 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initial);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', onBeforeUnload);
      sendReport(true);
    };
  }, [enabled, lessonId, startSec, durationSec]);

  return null;
}
