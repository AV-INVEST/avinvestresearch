'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSession } from 'next-auth/react';
import { AlertCircle, ArrowRight, CheckCircle2, CreditCard, Loader2, X } from 'lucide-react';
import { LIVE_EVENT_PRICE_LABEL } from '@/lib/admin/live-event-shared';

interface Props {
  eventId: string;
  eventTitle: string;
  priceLabel?: string;
  className?: string;
}

type ButtonState = 'idle' | 'loading' | 'error';

/** Versione del consenso (termini + disclaimer) registrata con il biglietto. */
const CONSENT_TERMS_VERSION = 'v1';

/**
 * Pulsante di acquisto del biglietto. Richiede login Google, raccoglie il
 * consenso a Termini e Disclaimer e avvia il checkout dedicato agli eventi.
 * Nessuna rinuncia automatica al diritto di recesso.
 */
export default function LiveEventCheckoutButton({
  eventId,
  eventTitle,
  priceLabel = LIVE_EVENT_PRICE_LABEL,
  className = '',
}: Props) {
  const { data: session, status: sessionStatus } = useSession();
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const onOpen = useCallback(() => {
    if (sessionStatus === 'loading') return;
    const userEmail = session?.user?.email;
    if (!userEmail) {
      window.location.assign('/login?callbackUrl=' + encodeURIComponent('/eventi'));
      return;
    }
    setErrorMsg(null);
    setAccept(false);
    setModalOpen(true);
  }, [session, sessionStatus]);

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

  const onSubmit = useCallback(async () => {
    if (!accept) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/stripe/events/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          consentTermsVersion: CONSENT_TERMS_VERSION,
          consentAcceptedAt: new Date().toISOString(),
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
        throw new Error(payload.error || 'Errore durante l’avvio del pagamento.');
      }
      if (!payload.url) throw new Error('Nessun URL di pagamento restituito.');
      window.location.assign(payload.url);
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Errore sconosciuto.');
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  }, [accept, eventId]);

  const isLoading = state === 'loading';
  const hasError = state === 'error';

  return (
    <div className={`space-y-3 ${className}`}>
      <button
        type="button"
        onClick={onOpen}
        aria-busy={isLoading}
        className="btn-rc-primary shadow-glow-gold-sm w-full items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparazione del pagamento...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Acquista biglietto · {priceLabel}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {hasError ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs sm:text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" />
          <div className="min-w-0">
            <p className="font-semibold">Pagamento non disponibile</p>
            <p className="mt-1 leading-relaxed break-words">{errorMsg}</p>
          </div>
        </div>
      ) : null}

      {modalOpen && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[999] flex items-center justify-center px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-4"
              role="presentation"
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} aria-hidden="true" />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="evt-consent-title"
                className="relative z-10 flex w-full max-w-lg max-h-[86dvh] sm:max-h-[92vh] flex-col overflow-hidden rounded-2xl border border-[#C9A961]/25 bg-av-surface p-4 sm:p-6 shadow-2xl focus:outline-none"
                tabIndex={-1}
              >
                <div className="flex flex-none items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="eyebrow !border-[#C9A961]/50 !bg-[#C9A961]/10 !text-[#E4CE96]">Biglietto evento</span>
                    <h3 id="evt-consent-title" className="mt-2 font-display text-lg font-semibold text-white sm:text-2xl">
                      Conferma per {eventTitle}
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

                <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-0.5">
                  <p className="text-sm leading-relaxed text-av-muted">
                    Il biglietto è personale e non trasferibile, valido per un solo account e per
                    questo evento. L’accesso a Google Meet sarà disponibile nell’area membri da 60
                    minuti prima dell’inizio.
                  </p>

                  <label
                    htmlFor="evt-consent-terms"
                    className={`mt-4 flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition sm:p-4 ${
                      accept ? 'border-[#C9A961]/60 bg-[#C9A961]/10' : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id="evt-consent-terms"
                      type="checkbox"
                      checked={accept}
                      onChange={(e) => setAccept(e.target.checked)}
                      aria-required="true"
                      className="mt-0.5 h-4 w-4 flex-none accent-[#C9A961]"
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Dichiaro di avere almeno 18 anni, ho letto e accetto i{' '}
                      <a href="/termini" target="_blank" rel="noreferrer" className="underline decoration-[#C9A961]/70 underline-offset-2 hover:text-[#E4CE96]">
                        Termini e condizioni
                      </a>{' '}
                      e il{' '}
                      <a href="/disclaimer" target="_blank" rel="noreferrer" className="underline decoration-[#C9A961]/70 underline-offset-2 hover:text-[#E4CE96]">
                        Disclaimer
                      </a>{' '}
                      di AV-INVEST Research.
                    </span>
                  </label>

                  <div
                    className={`mt-4 flex items-start gap-2 rounded-lg border px-3 py-1.5 text-xs sm:rounded-xl sm:py-2 ${
                      accept ? 'border-[#C9A961]/40 bg-[#C9A961]/5 text-[#E4CE96]' : 'border-av-line bg-av-bg/60 text-av-muted'
                    }`}
                    aria-live="polite"
                  >
                    <CheckCircle2 className={`mt-0.5 h-4 w-4 flex-none ${accept ? 'text-[#C9A961]' : 'text-av-muted/60'}`} />
                    <p className="leading-relaxed">
                      {accept ? 'Puoi continuare al pagamento.' : 'Accetta i Termini per sbloccare il pulsante.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-none flex-row items-stretch gap-2 sm:mt-6 sm:items-center sm:justify-end sm:gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="btn-ghost flex-none items-center justify-center px-4 sm:px-5 disabled:opacity-50"
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!accept || submitting}
                    aria-disabled={!accept || submitting}
                    className="btn-rc-primary shadow-glow-gold-sm min-w-0 flex-1 items-center justify-center gap-1.5 sm:flex-none sm:w-auto sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            document.body,
          )
        : null}
    </div>
  );
}
