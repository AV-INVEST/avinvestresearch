'use client';

import { useCallback, useState } from 'react';
import { AlertCircle, ArrowRight, Crown, Loader2, LogIn } from 'lucide-react';

type LabelVariant = 'full' | 'short';

interface Props {
  label?: LabelVariant;
  returnTo?: string;
  className?: string;
}

type ButtonState = 'idle' | 'loading' | 'error';

export default function ResearchClubCheckoutButton({
  label = 'full',
  returnTo = '/#research-club',
  className = '',
}: Props) {
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState<false | 'loading' | 'visible'>(false);

  const cta = label === 'short' ? 'ENTRA NEL RC' : 'ENTRA NEL RESEARCH CLUB';

  const onCheckout = useCallback(async () => {
    setState('loading');
    setErrorMsg(null);
    setNeedsLogin('loading');
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
      const userEmail = session?.user?.email;
      if (!userEmail) {
        const cb = returnTo || '/#research-club';
        window.location.assign('/login?callbackUrl=' + encodeURIComponent(cb));
        return;
      }
      setNeedsLogin(false);

      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'research-club' }),
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
        throw new Error(payload.error || 'Errore durante l\'avvio del pagamento.');
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
      if (state !== 'loading') setNeedsLogin(false);
    }
  }, [returnTo]);

  const isLoading = state === 'loading' || needsLogin === 'loading';
  const hasError = state === 'error';

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <button
        type="button"
        onClick={onCheckout}
        disabled={isLoading}
        aria-busy={isLoading}
        className="btn-rc-primary w-full items-center justify-center gap-2 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-[#C9A961]" />
            <span className="text-white">
              {needsLogin === 'loading' ? 'Verifica accesso...' : 'Preparazione pagamento...'}
            </span>
          </>
        ) : (
          <>
            {needsLogin === 'visible' ? (
              <LogIn className="h-5 w-5 text-[#C9A961]" />
            ) : (
              <Crown className="h-5 w-5 text-[#C9A961]" />
            )}
            <span className="text-white">{cta}</span>
            {needsLogin !== 'visible' ? (
              <ArrowRight className="h-4 w-4 text-[#C9A961]" />
            ) : null}
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
                'Si è verificato un errore. Riprova tra qualche istante o verifica di essere connesso a Internet.'}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
