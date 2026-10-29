'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AlertCircle, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

type CourseCheckoutSlug = 'foundations' | 'trading-lab' | 'complete-academy';

interface Props {
  slug: CourseCheckoutSlug;
  variant?: 'green' | 'gold';
}

type ButtonState = 'idle' | 'loading' | 'error';

const PURCHASABLE_BY_SLUG: Record<CourseCheckoutSlug, boolean> = {
  foundations: (siteConfig.courses.foundations.purchasable as boolean) !== false,
  'trading-lab': (siteConfig.courses.tradingLab.purchasable as boolean) !== false,
  'complete-academy': (siteConfig.courseBundle.purchasable as boolean) !== false,
};

export default function CourseCheckoutButton({ slug, variant = 'green' }: Props) {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onCheckout = useCallback(async () => {
    setState('loading');
    setErrorMsg(null);
    try {
      if (sessionStatus === 'loading') {
        setState('idle');
        return;
      }
      const userEmail = session?.user?.email;
      if (!userEmail) {
        const cb = '/#percorsi';
        window.location.assign('/login?callbackUrl=' + encodeURIComponent(cb));
        return;
      }

      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const payload = (await resp.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        loginUrl?: string;
        redirectTo?: string;
      };
      if (!resp.ok) {
        if (resp.status === 401 && payload.loginUrl) {
          window.location.assign(payload.loginUrl);
          return;
        }
        if (resp.status === 409 && payload.redirectTo) {
          window.location.assign(payload.redirectTo);
          return;
        }
        throw new Error(payload.error || 'Errore durante lavvio del pagamento.');
      }
      if (!payload.url) {
        throw new Error('Nessun URL di pagamento restituito.');
      }
      window.location.assign(payload.url);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore sconosciuto.');
    } finally {
      setState((s) => (s === 'error' ? 'error' : 'idle'));
    }
  }, [slug, session, sessionStatus]);

  const isLoading = state === 'loading';
  const hasError = state === 'error';

  const purchasable = PURCHASABLE_BY_SLUG[slug];
  if (!purchasable) return null;

  return (
    <div className="mt-6 w-full space-y-3">
      <button
        type="button"
        onClick={onCheckout}
        disabled={isLoading}
        aria-busy={isLoading}
        className={`${variant === 'gold' ? 'btn-rc-primary shadow-glow-gold-sm' : 'btn-primary shadow-glow-green-sm'} w-full items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparazione del pagamento in corso...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Acquista ora
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {hasError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs sm:text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" />
          <div className="min-w-0">
            <p className="font-semibold">Pagamento non disponibile</p>
            <p className="mt-1 leading-relaxed break-words">
              {errorMsg ||
                'Si e verificato un errore. Riprova tra qualche istante o verifica di essere connesso a Internet.'}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
