'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Cookie, X, ChevronRight, Settings, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cookieCategories, type CookieCategory } from '@/config/cookieConfig';
import { useCookieConsent } from './CookieConsentContext';

export default function CookieConsent() {
  const {
    open,
    showPreferences,
    state,
    setOpen,
    acceptAll,
    rejectNonNecessary,
    savePreferences,
    togglePreferences,
  } = useCookieConsentUi();

  const [selected, setSelected] = useState<Record<CookieCategory, boolean>>(
    state.categories,
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const firstFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setSelected(state.categories);
  }, [state.categories, open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false, false);
        triggerRef.current?.focus?.();
      }
      if (e.key === 'Tab') {
        const root = panelRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', onKey);

    const root = panelRef.current;
    if (root) {
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length) {
        firstFocusRef.current = focusable[0];
        requestAnimationFrame(() => focusable[0].focus());
      }
    }

    return () => document.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  const handleSavePreferences = useCallback(() => {
    savePreferences(selected);
  }, [savePreferences, selected]);

  const openPanel = () => setOpen(true, showPreferences);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true, false)}
        className="fixed bottom-28 right-3 z-30 hidden h-11 w-11 items-center justify-center rounded-xl border border-av-green-deep/40 bg-av-bg/85 text-av-green shadow-glow-green-sm backdrop-blur lg:grid"
        aria-label="Apri le impostazioni cookie"
      >
        <Cookie className="h-5 w-5" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center px-3 pb-24 pt-10 sm:items-center sm:pb-0"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-title"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false, false)}
          />
          <div
            ref={panelRef}
            className="relative z-10 w-full max-w-lg rounded-2xl border border-av-line bg-av-bg/95 shadow-[0_20px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl animate-fade-in-up"
          >
            <div className="flex items-start justify-between gap-4 border-b border-av-line p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/60 bg-av-green/10 text-av-green">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="cookie-title" className="font-display text-lg font-semibold text-white sm:text-xl">
                    Cookie e preferenze
                  </h2>
                  <p className="mt-1 text-sm text-av-muted">
                    Usiamo cookie e tecnologie simili per garantire il corretto
                    funzionamento del sito e, solo con il tuo consenso, per funzionalità
                    aggiuntive, analisi e marketing.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false, false)}
                className="grid h-9 w-9 flex-none place-items-center rounded-lg text-av-muted transition-colors hover:bg-av-surface hover:text-white"
                aria-label="Chiudi pannello cookie"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {showPreferences ? (
              <div className="space-y-3 p-4 sm:p-6">
                <div className="rounded-xl border border-av-line bg-av-surface/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
                    Categorie
                  </p>
                  <ul className="mt-4 space-y-4">
                    {cookieCategories.map((cat) => {
                      const checked = !!selected[cat.id];
                      return (
                        <li key={cat.id} className="rounded-xl border border-av-line bg-av-bg/60 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white">{cat.label}</p>
                              <p className="mt-1 text-xs leading-relaxed text-av-muted sm:text-sm">
                                {cat.description}
                              </p>
                            </div>
                            <label className="relative inline-flex flex-none cursor-pointer items-center">
                              <input
                                type="checkbox"
                                className="peer sr-only"
                                checked={checked}
                                disabled={!!cat.alwaysActive}
                                onChange={(e) =>
                                  setSelected((s) => ({
                                    ...s,
                                    [cat.id]: cat.alwaysActive ? true : e.target.checked,
                                  }))
                                }
                                aria-label={`Abilita categoria ${cat.label}`}
                              />
                              <div className="h-6 w-11 rounded-full border border-av-line bg-av-bg-2 transition-colors peer-checked:border-av-green-deep peer-checked:bg-av-green/20 peer-disabled:opacity-60" />
                              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-av-muted transition-all peer-checked:translate-x-5 peer-checked:bg-av-green peer-disabled:opacity-60" />
                            </label>
                          </div>
                          {cat.alwaysActive ? (
                            <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-av-green">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Sempre attivi
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    onClick={togglePreferences}
                    className="btn-ghost !py-3"
                  >
                    Indietro
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="btn-primary !py-3"
                  >
                    Salva preferenze
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid gap-2 text-xs text-av-muted sm:text-sm">
                  <p>
                    Per maggiori dettagli consulta la{' '}
                    <a
                      href="/cookie"
                      className="text-white underline decoration-av-green/50 underline-offset-4 hover:text-av-green"
                    >
                      Cookie Policy
                    </a>
                    . Puoi aprire questo pannello in qualsiasi momento dal footer o
                    dall&apos;icona in basso a destra.
                  </p>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3 sm:items-center">
                  <button
                    type="button"
                    onClick={rejectNonNecessary}
                    className="btn-ghost !py-3 justify-center"
                  >
                    Rifiuta non necessari
                  </button>
                  <button
                    type="button"
                    onClick={togglePreferences}
                    className="btn-ghost !py-3 justify-center"
                  >
                    <Settings className="h-4 w-4" />
                    Personalizza
                  </button>
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="btn-primary !py-3 justify-center shadow-glow-green-sm"
                  >
                    Accetta tutti
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function useCookieConsentUi() {
  const ctx = useCookieConsent();
  return ctx;
}
