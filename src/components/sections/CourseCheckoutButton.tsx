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
  Lock,
  X,
} from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import SaleAvailabilityBadge from '@/components/sales/SaleAvailabilityBadge';
import { useSale } from '@/lib/sales/sales-client';
import { isSalePurchasable } from '@/lib/sales/sales-shared';

type CourseCheckoutSlug = 'foundations' | 'trading-lab' | 'complete-academy';

interface Props {
  slug: CourseCheckoutSlug;
  variant?: 'green' | 'gold';
  /**
   * Il prodotto ha un checkout già avviato: la CTA riprende la stessa
   * sessione Stripe valida (o ne crea una nuova se scaduta), senza
   * presumere che sia ancora aperta.
   */
  pending?: boolean;
}

type ButtonState = 'idle' | 'loading' | 'error';

const CONSENT_TERMS_VERSION = 'v1';
const CONSENT_DIGITAL_WITHDRAWAL_VERSION = 'v1';

const PURCHASABLE_BY_SLUG: Record<CourseCheckoutSlug, boolean> = {
  foundations: (siteConfig.courses.foundations.purchasable as boolean) !== false,
  'trading-lab': (siteConfig.courses.tradingLab.purchasable as boolean) !== false,
  'complete-academy': (siteConfig.courseBundle.purchasable as boolean) !== false,
};

const TITLE_BY_SLUG: Record<CourseCheckoutSlug, string> = {
  foundations: 'AV Foundations',
  'trading-lab': 'AV Trading Lab',
  'complete-academy': 'AV Complete Academy',
};

const VARIANT_STYLES = {
  green: {
    modalBorder: 'border-av-line',
    eyebrow: 'eyebrow',
    checkboxOn: 'border-av-green-deep/60 bg-av-green/10',
    accent: 'accent-av-green',
    link: 'decoration-av-green-deep underline-offset-2 hover:text-av-green',
    statusOn: 'border-av-green-deep/40 bg-av-green/5 text-av-green',
    iconOn: 'text-av-green',
    confirmBtn: 'btn-primary shadow-glow-green-sm',
  },
  gold: {
    modalBorder: 'border-[#C9A961]/25',
    eyebrow: 'eyebrow !border-[#C9A961]/50 !bg-[#C9A961]/10 !text-[#E4CE96]',
    checkboxOn: 'border-[#C9A961]/60 bg-[#C9A961]/10',
    accent: 'accent-[#C9A961]',
    link: 'decoration-[#C9A961]/70 underline-offset-2 hover:text-[#E4CE96]',
    statusOn: 'border-[#C9A961]/40 bg-[#C9A961]/5 text-[#E4CE96]',
    iconOn: 'text-[#C9A961]',
    confirmBtn: 'btn-rc-primary shadow-glow-gold-sm',
  },
} as const;

export default function CourseCheckoutButton({ slug, variant = 'green', pending = false }: Props) {
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

  const styles = VARIANT_STYLES[variant];
  const productTitle = TITLE_BY_SLUG[slug];

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
        const cb = '/#percorsi';
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
          slug,
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
        throw new Error(payload.error || 'Errore durante lavvio del pagamento.');
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
  }, [slug, acceptTerms, acceptDigital]);

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

  const sale = useSale(slug);
  // Le sessioni Stripe già avviate (pending) continuano normalmente, anche con
  // switch OFF: la disponibilità commerciale riguarda solo l'avvio di nuovi acquisti.
  const saleOpen = pending || isSalePurchasable(sale);

  const purchasable = PURCHASABLE_BY_SLUG[slug];
  if (!purchasable) return null;

  return (
    <div className="mt-6 w-full space-y-3">
      {!pending ? <SaleAvailabilityBadge sale={sale} tone={variant} /> : null}
      <button
        type="button"
        onClick={onOpen}
        disabled={isLoading || !saleOpen}
        aria-busy={isLoading}
        aria-disabled={!saleOpen}
        className={`${variant === 'gold' ? 'btn-rc-primary shadow-glow-gold-sm' : 'btn-primary shadow-glow-green-sm'} w-full items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Preparazione del pagamento in corso...
          </>
        ) : !saleOpen ? (
          <>
            <Lock className="h-5 w-5" />
            Non disponibile
          </>
        ) : pending ? (
          <>
            <ArrowRight className="h-4 w-4" />
            Continua al checkout
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
                aria-labelledby={`course-consent-${slug}-title`}
                aria-describedby={`course-consent-${slug}-desc`}
                className={`relative z-10 w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border ${styles.modalBorder} bg-av-surface p-5 sm:p-6 shadow-2xl animate-fade-in-up focus:outline-none`}
                tabIndex={-1}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={styles.eyebrow}>Passaggio obbligatorio</span>
                    <h3
                      id={`course-consent-${slug}-title`}
                      className="mt-2 font-display text-xl sm:text-2xl font-semibold text-white"
                    >
                      Conferma per {productTitle}
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
                  id={`course-consent-${slug}-desc`}
                  className="mt-3 text-sm leading-relaxed text-av-muted"
                >
                  Prima di procedere al pagamento del corso, conferma le due opzioni
                  seguenti. Sono obbligatorie per completare l&apos;acquisto.
                </p>

                <div className="mt-5 space-y-3">
                  <label
                    htmlFor={`course-consent-${slug}-terms`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      acceptTerms
                        ? styles.checkboxOn
                        : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id={`course-consent-${slug}-terms`}
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      aria-required="true"
                      className={`mt-0.5 h-4 w-4 flex-none ${styles.accent}`}
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Ho letto e accetto i{' '}
                      <a
                        href="/termini"
                        target="_blank"
                        rel="noreferrer"
                        className={`underline ${styles.link}`}
                      >
                        Termini e condizioni
                      </a>{' '}
                      e il{' '}
                      <a
                        href="/disclaimer"
                        target="_blank"
                        rel="noreferrer"
                        className={`underline ${styles.link}`}
                      >
                        Disclaimer
                      </a>{' '}
                      di AV-INVEST Research.
                    </span>
                  </label>

                  <label
                    htmlFor={`course-consent-${slug}-digital`}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                      acceptDigital
                        ? styles.checkboxOn
                        : 'border-av-line bg-av-bg-2/50 hover:border-white/15'
                    }`}
                  >
                    <input
                      id={`course-consent-${slug}-digital`}
                      type="checkbox"
                      checked={acceptDigital}
                      onChange={(e) => setAcceptDigital(e.target.checked)}
                      aria-required="true"
                      className={`mt-0.5 h-4 w-4 flex-none ${styles.accent}`}
                    />
                    <span className="text-sm leading-relaxed text-white/90">
                      Richiedo l&rsquo;accesso immediato al contenuto digitale e riconosco che, con l&rsquo;inizio della fornitura, perdo il diritto di recesso nei casi previsti dalla legge.
                    </span>
                  </label>
                </div>

                <div
                  className={`mt-5 flex items-start gap-2 rounded-xl border px-3 py-2 text-xs ${
                    bothChecked
                      ? styles.statusOn
                      : 'border-av-line bg-av-bg/60 text-av-muted'
                  }`}
                  aria-live="polite"
                >
                  <CheckCircle2
                    className={`mt-0.5 h-4 w-4 flex-none ${
                      bothChecked ? styles.iconOn : 'text-av-muted/60'
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
                    className={`${styles.confirmBtn} w-full sm:w-auto items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
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
