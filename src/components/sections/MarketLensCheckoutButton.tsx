'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  X,
} from 'lucide-react';

type ButtonState = 'idle' | 'loading' | 'error';
type LabelVariant = 'buy' | 'resume';

interface Props {
  label?: LabelVariant;
  compact?: boolean;
  className?: string;
}

const CONSENT_TERMS_VERSION = 'v1';
const CONSENT_DIGITAL_WITHDRAWAL_VERSION = 'v1';

export default function MarketLensCheckoutButton({
  label = 'buy',
  compact = false,
  className = '',
}: Props) {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptDigital, setAcceptDigital] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ctaLabel = label === 'resume' ? 'RIPRENDI PAGAMENTO' : 'Acquista a 39,90 €';
  const loadingLabel = label === 'resume' ? 'Verifica accesso...' : 'Verifica accesso...';

  const onOpen = useCallback(() => {
    setState('loading');
    setErrorMsg(null);
    try {
      if (sessionStatus === 'loading') {
        setState('idle');
        return;
      }
      const userEmail = session?.user?.email;
      if (!userEmail) {
        const cb = '/#market-lens';
        window.location.assign('/login?callbackUrl=' + encodeURIComponent(cb));
        return;
      }
      setAcceptTerms(false);
      setAcceptDigital(false);
      setModalOpen(true);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore sconosciuto.');
    } finally {
      setState((s) => (s === 'error' ? 'error' : 'idle'));
    }
  }, [session, sessionStatus]);

  const onSubmitConsent = useCallback(async () => {
    if (!acceptTerms || !acceptDigital) return;
    setSubmitting(true);
    setErrorMsg(null);
    const consentAcceptedAt = new Date().toISOString();
    try {
      const resp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'market-lens',
          consentTermsVersion: CONSENT_TERMS_VERSION,
          consentDigitalWithdrawalVersion: CONSENT_DIGITAL_WITHDRAWAL_VERSION,
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
  }, [acceptTerms, acceptDigital]);

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

  const isLoading = state === 'loading';
  const hasError = state === 'error';
  const bothChecked = acceptTerms && acceptDigital;

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <button
        type="button"
        onClick={onOpen}
        disabled={isLoading}
        aria-busy={isLoading}
        className={`btn-primary w-full items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60 disabled:cursor-not-allowed ${
          compact ? '!py-2 !px-3.5 text-[12px]' : ''
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className={compact ? 'h-3.5 w-3.5 animate-spin' : 'h-5 w-5 animate-spin'} />
            {loadingLabel}
          </>
        ) : (
          <>
            <CreditCard className={compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} />
            {ctaLabel}
            <ArrowRight className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
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
                aria-labelledby="market-lens-consent-title"
                aria-describedby="market-lens-consent-desc"
                className="relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-av-line bg-av-surface p-5 sm:p-6 shadow-2xl animate-fade-in-up focus:outline-none"
                tabIndex={-1}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="eyebrow">Passaggio obbligatorio</span>
                    <h3
                      id="market-lens-consent-title"
                      className="mt-2 font-display text-xl sm:text-2xl font-semibold text-white"
                    >
                      Conferma per AV Market Lens
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
                  id="market-lens-consent-desc"
                  className="mt-3 text-sm leading-relaxed text-av-muted"
                >
                  Prima di procedere al pagamento, conferma le due opzioni seguenti.
                  Sono obbligatorie per completare l&apos;acquisto.
                </p>

                <div className="mt-5 space-y-3">
                  <label
                    htmlFor="market-lens-consent-terms"
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      acceptTerms
                        ? 'border-av-green-deep/60 bg-av-green/10'
                        : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id="market-lens-consent-terms"
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      aria-required="true"
                      className="mt-0.5 h-4 w-4 flex-none accent-av-green"
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Ho letto e accetto i{' '}
                      <a
                        href="/termini"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-av-green-deep underline-offset-2 hover:text-av-green"
                      >
                        Termini e condizioni
                      </a>{' '}
                      e il{' '}
                      <a
                        href="/disclaimer"
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-av-green-deep underline-offset-2 hover:text-av-green"
                      >
                        Disclaimer
                      </a>{' '}
                      di AV-INVEST Research.
                    </span>
                  </label>

                  <label
                    htmlFor="market-lens-consent-digital"
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      acceptDigital
                        ? 'border-av-green-deep/60 bg-av-green/10'
                        : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id="market-lens-consent-digital"
                      type="checkbox"
                      checked={acceptDigital}
                      onChange={(e) => setAcceptDigital(e.target.checked)}
                      aria-required="true"
                      className="mt-0.5 h-4 w-4 flex-none accent-av-green"
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Richiedo l&rsquo;accesso immediato al contenuto digitale e riconosco che il diritto di recesso pu&ograve; venir meno nei casi previsti dalla legge.
                    </span>
                  </label>
                </div>

                <div
                  className={`mt-5 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
                    bothChecked
                      ? 'border-av-green-deep/40 bg-av-green/5 text-av-green'
                      : 'border-av-line bg-av-bg/60 text-av-muted'
                  }`}
                  aria-live="polite"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 flex-none ${
                      bothChecked ? 'text-av-green' : 'text-av-muted/60'
                    }`}
                  />
                  <p className="leading-relaxed">
                    {bothChecked
                      ? 'Puoi continuare. Confermando, confermi anche le due dichiarazioni sopra.'
                      : 'Seleziona entrambe le caselle per sbloccare il pulsante Continua.'}
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
                    disabled={!bothChecked || submitting}
                    aria-disabled={!bothChecked || submitting}
                    className="btn-primary w-full sm:w-auto items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-green-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Avvio pagamento...
                      </>
                    ) : (
                      <>
                        Continua al pagamento
                        <ArrowRight className="h-4 w-4" />
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
