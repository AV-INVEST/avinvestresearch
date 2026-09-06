'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, ArrowRight, CreditCard, Loader2 } from 'lucide-react';

interface Props {
  slug: 'foundations' | 'trading-lab';
}

type ButtonState = 'idle' | 'loading' | 'error';

export default function CourseCheckoutButton({ slug }: Props) {
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onCheckout = useCallback(async () => {
    setState('loading');
    setErrorMsg(null);
    try {
      const sessionResp = await fetch('/api/auth/session', {
        cache: 'no-store',
      });
      type AuthSessionShape = { user?: { email?: string; id?: string } } | null;
      let session: AuthSessionShape = null;
      if (sessionResp.ok) {
        try {
          session = (await sessionResp.json()) as AuthSessionShape;
        } catch {
          session = null;
        }
      }
      const userEmail = (session as AuthSessionShape)?.user?.email;
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
      };
      if (!resp.ok) {
        if (resp.status === 401 && payload.loginUrl) {
          window.location.assign(payload.loginUrl);
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
  }, [slug]);

  const isLoading = state === 'loading';
  const hasError = state === 'error';

  return (
    <div className="mt-6 w-full space-y-3">
      <button
        type="button"
        onClick={onCheckout}
        disabled={isLoading}
        aria-busy={isLoading}
        className="btn-primary w-full items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60 disabled:cursor-not-allowed"
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
