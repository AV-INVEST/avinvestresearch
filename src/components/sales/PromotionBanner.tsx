'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useSales } from '@/lib/sales/sales-client';
import type { PromotionState, PromotionTheme } from '@/lib/sales/sales-shared';

interface ThemeTokens {
  /** Bordo con stati hover. */
  ring: string;
  /** Sfumatura delicata nel colore del tema (inline style). */
  gradient: string;
  /** Etichetta del nome campagna. */
  label: string;
  /** Chip del codice promozionale. */
  chip: string;
  /** Pulsante COPIA CODICE. */
  copy: string;
  /** Pallino luminoso. */
  dot: string;
  /** Alone discreto. */
  glow: string;
}

/**
 * Tre temi prestabiliti, coerenti con il design del sito e con contrasto
 * verificato. Nessun color picker libero.
 */
const THEMES: Record<PromotionTheme, ThemeTokens> = {
  gold: {
    ring: 'border-[#C9A961]/30 hover:border-[#C9A961]/55',
    gradient:
      'linear-gradient(135deg, rgba(201,169,97,0.14), rgba(201,169,97,0.03) 55%, rgba(5,7,5,0))',
    label: 'border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]',
    chip: 'border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]',
    copy: 'border-[#C9A961]/50 bg-[#C9A961]/10 text-[#E4CE96] hover:bg-[#C9A961]/20',
    dot: 'bg-[#C9A961]',
    glow: 'shadow-[0_18px_50px_-30px_rgba(201,169,97,0.75)]',
  },
  green: {
    ring: 'border-av-green-deep/35 hover:border-av-green-deep/65',
    gradient:
      'linear-gradient(135deg, rgba(0,255,106,0.10), rgba(0,255,106,0.02) 55%, rgba(5,7,5,0))',
    label: 'border-av-green-deep/45 bg-av-green/10 text-av-green',
    chip: 'border-av-green-deep/45 bg-av-green/10 text-av-green',
    copy: 'border-av-green-deep/50 bg-av-green/10 text-av-green hover:bg-av-green/20',
    dot: 'bg-av-green',
    glow: 'shadow-[0_18px_50px_-30px_rgba(0,255,106,0.65)]',
  },
  anthracite: {
    ring: 'border-av-line hover:border-white/25',
    gradient:
      'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01) 55%, rgba(5,7,5,0))',
    label: 'border-av-line bg-white/[0.04] text-white/80',
    chip: 'border-av-line bg-white/[0.05] text-white',
    copy: 'border-av-line bg-white/[0.05] text-white hover:bg-white/[0.12]',
    dot: 'bg-white/70',
    glow: 'shadow-[0_18px_50px_-32px_rgba(255,255,255,0.35)]',
  },
};

/**
 * Fallback per browser senza Clipboard API (contesti non-sicuri).
 */
function legacyCopy(text: string): boolean {
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Banner promozionale presentazionale. Riusato dall'anteprima admin e dalla Hero:
 * nessuna chiamata aggiuntiva, nessun polling. Testi mostrati come testo semplice.
 */
export function PromotionBannerView({ promotion }: { promotion: PromotionState }) {
  const t = THEMES[promotion.theme] ?? THEMES.gold;
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const code = promotion.code.trim();

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    if (!code) return;
    let ok = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        ok = true;
      } else if (typeof document !== 'undefined') {
        ok = legacyCopy(code);
      }
    } catch {
      ok = false;
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div
      role="note"
      aria-label="Promozione in corso"
      className={[
        'overflow-hidden rounded-2xl border px-4 py-3.5 backdrop-blur-sm transition-colors duration-300 sm:px-5 sm:py-4',
        t.ring,
        t.glow,
      ].join(' ')}
      style={{ backgroundImage: t.gradient }}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-[7px] h-2 w-2 flex-none rounded-full ${t.dot}`}
        />
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex max-w-full truncate rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] ${t.label}`}
          >
            {promotion.campaignName}
          </span>
          <p className="mt-1.5 font-display text-sm font-semibold leading-snug text-white sm:text-[15px]">
            {promotion.headline}
          </p>
          {promotion.description ? (
            <p className="mt-1 text-[12px] leading-relaxed text-av-muted sm:text-[13px]">
              {promotion.description}
            </p>
          ) : null}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <code
              className={`inline-flex items-center rounded-lg border px-2.5 py-1 font-mono text-[12px] font-bold tracking-wider ${t.chip}`}
            >
              {code}
            </code>
            <button
              type="button"
              onClick={copy}
              disabled={!code}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 ${t.copy}`}
              aria-label={copied ? 'Codice copiato negli appunti' : 'Copia codice promozionale'}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Copiato
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copia codice
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Banner promozionale della Hero. Legge lo stato condiviso dal `SalesProvider`
 * (già disponibile nella pagina): nessuna richiesta, nessun polling.
 * Se la campagna è OFF non renderizza nulla: nessuno spazio vuoto residuo.
 */
export default function PromotionBanner() {
  const { promotion } = useSales();
  if (!promotion.enabled) return null;
  return (
    <div className="mt-6 animate-fade-in-up [animation-delay:300ms]">
      <PromotionBannerView promotion={promotion} />
    </div>
  );
}
