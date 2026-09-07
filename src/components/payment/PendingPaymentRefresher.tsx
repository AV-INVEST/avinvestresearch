'use client';

import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { EntitlementsState } from '@/lib/entitlements';

const MAX_ATTEMPTS = 6;
const INTERVAL_MS = 5000;

export default function PendingPaymentRefresher({
  initialAnyPending = true,
  compact = false,
}: {
  initialAnyPending?: boolean;
  compact?: boolean;
}) {
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<'polling' | 'resolved' | 'exhausted'>(
    initialAnyPending ? 'polling' : 'resolved',
  );

  useEffect(() => {
    if (!initialAnyPending) {
      setStatus('resolved');
      return;
    }

    let cancelled = false;
    let attemptCount = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function tick() {
      attemptCount += 1;
      setAttempts(attemptCount);

      try {
        const resp = await fetch('/api/entitlements/me', {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });
        if (resp.ok) {
          const body = (await resp.json().catch(() => null)) as EntitlementsState | null;
          if (body && !body.anyPending) {
            if (!cancelled) {
              setStatus('resolved');
              setTimeout(() => {
                if (!cancelled) window.location.reload();
              }, 400);
            }
            return;
          }
        }
      } catch {
        // ignore poll errors
      }

      if (attemptCount >= MAX_ATTEMPTS) {
        if (!cancelled) setStatus('exhausted');
        return;
      }

      timer = setTimeout(tick, INTERVAL_MS);
    }

    timer = setTimeout(tick, INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [initialAnyPending]);

  if (status === 'resolved') {
    return (
      <div className="flex items-center gap-2 text-[11px] font-medium text-av-green">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Pagamento confermato: aggiornamento in corso...
      </div>
    );
  }

  if (status === 'exhausted') {
    return (
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={`inline-flex items-center gap-1.5 rounded-lg border border-av-yellow-deep/50 bg-av-yellow/10 px-3 py-1.5 text-xs font-semibold text-av-yellow hover:bg-av-yellow/20 ${
            compact ? '!px-2.5 !py-1 text-[11px]' : ''
          }`}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Ricarica ora
        </button>
        <span className="text-[11px] text-av-yellow/80">
          Se hai completato il pagamento, l&apos;accesso verrà sbloccato al termine della conferma.
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex items-center gap-2 text-[11px] text-av-yellow/85">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>
        Attesa conferma automatica... tentativo {attempts}/{MAX_ATTEMPTS}
      </span>
    </div>
  );
}
