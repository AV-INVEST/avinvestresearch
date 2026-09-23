'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Crown,
  Loader2,
  LogIn,
  X,
} from 'lucide-react';

const CONSENT_TERMS_VERSION = 'v1';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cta = label === 'short' ? 'ENTRA NEL RC' : 'ENTRA NEL RESEARCH CLUB';

  const onOpen = useCallback(async () => {
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
      setAcceptTerms(false);
      setModalOpen(true);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore sconosciuto.');
    } finally {
      setState((s) => (s === 'error' ? 'error' : 'idle'));
      if (state !== 'loading') setNeedsLogin(false);
    }
  }, [returnTo, state]);

  const onSubmitConsent = useCallback(async () => {
    if (!acceptTerms) return;
    setSubmitting(true);
    setErrorMsg(null);
    const consentAcceptedAt = new Date().toISOString();
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'research-club',
          consentTermsVersion: CONSENT_TERMS_VERSION,
          consentAcceptedAt,
        }),
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
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }, [acceptTerms]);

  const closeModal = useCallback(() => {
    if (submitting) return;
    setModalOpen(false);
  }, [submitting]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [modalOpen, closeModal]);

  const isLoading = state === 'loading' || needsLogin === 'loading';
  const hasError = state === 'error';

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <button
        type="button"
        onClick={onOpen}
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

      {modalOpen && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[999] flex items-end justify-center sm:items-center p-0 sm:p-4"
              role="presentation"
            >
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={closeModal}
                aria-hidden="true"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="rc-consent-title"
                aria-describedby="rc-consent-desc"
                className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-av-line bg-av-surface p-5 sm:p-6 shadow-2xl animate-fade-in-up focus:outline-none"
                tabIndex={-1}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="eyebrow">Passaggio obbligatorio</span>
                    <h3
                      id="rc-consent-title"
                      className="mt-2 font-display text-xl sm:text-2xl font-semibold text-white"
                    >
                      Conferma per AV Research Club
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    aria-label="Chiudi"
                    className="grid h-9 w-9 flex-none place-items-center rounded-full border border-av-line text-av-muted transition hover:border-white/20 hover:text-white disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p
                  id="rc-consent-desc"
                  className="mt-3 text-sm leading-relaxed text-av-muted"
                >
                  Prima di procedere al pagamento, conferma l&apos;opzione seguente.
                  &Egrave; obbligatoria per completare l&apos;abbonamento.
                </p>

                <div className="mt-5 space-y-3">
                  <label
                    htmlFor="rc-consent-terms"
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      acceptTerms
                        ? 'border-[#C9A961]/60 bg-[#C9A961]/10'
                        : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id="rc-consent-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      aria-required="true"
                      className="mt-0.5 h-4 w-4 flex-none accent-[#C9A961]"
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Accetto i{' '}
                      <a
                        href="/termini"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-[#C9A961] underline-offset-2 hover:text-[#C9A961]"
                      >
                        Termini e condizioni
                      </a>{' '}
                      e confermo l&apos;abbonamento AV Research Club a 19,90 &euro; al mese, con rinnovo automatico fino alla disdetta.
                    </span>
                  </label>
                </div>

                <div
                  className={`mt-5 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
                    acceptTerms
                      ? 'border-[#C9A961]/40 bg-[#C9A961]/5 text-[#C9A961]'
                      : 'border-av-line bg-av-bg/60 text-av-muted'
                  }`}
                  aria-live="polite"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 flex-none ${
                      acceptTerms ? 'text-[#C9A961]' : 'text-av-muted/60'
                    }`}
                  />
                  <p className="leading-relaxed">
                    {acceptTerms
                      ? 'Puoi continuare. Confermando, confermi anche la dichiarazione sopra.'
                      : 'Seleziona la casella per sbloccare il pulsante Continua.'}
                  </p>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="btn-ghost w-full sm:w-auto items-center justify-center disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={onSubmitConsent}
                    disabled={!acceptTerms || submitting}
                    aria-disabled={!acceptTerms || submitting}
                    className="btn-rc-primary w-full sm:w-auto items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin text-[#C9A961]" />
                        Avvio pagamento...
                      </>
                    ) : (
                      <>
                        Continua al pagamento
                        <ArrowRight className="h-4 w-4 text-[#C9A961]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
