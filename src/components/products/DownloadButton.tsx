'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileCode,
  FileText,
  Loader2,
} from 'lucide-react';

type Kind = 'indicator' | 'guide' | 'trading-starter-pdf';

const KIND_ENDPOINT: Record<Kind, string> = {
  indicator: '/api/products/market-lens/download/indicator',
  guide: '/api/products/market-lens/download/guide',
  'trading-starter-pdf': '/api/products/trading-starter/download',
};

const KIND_FILENAME_HINT: Record<Kind, string> = {
  indicator: 'AV-Market-Lens.pine',
  guide: 'AV-Market-Lens-Guida.pdf',
  'trading-starter-pdf': 'AV-Trading-Starter.pdf',
};

const KIND_ICON: Record<Kind, typeof FileCode> = {
  indicator: FileCode,
  guide: FileText,
  'trading-starter-pdf': FileText,
};

const COOLDOWN_SECONDS = 30;

interface Props {
  kind: Kind;
  label: string;
  subLabel?: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function DownloadButton({
  kind,
  label,
  subLabel,
  variant = 'secondary',
  className = '',
}: Props) {
  const Icon = KIND_ICON[kind];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownLeft(COOLDOWN_SECONDS);
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownLeft((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) {
            clearInterval(cooldownTimerRef.current);
            cooldownTimerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const disabled = loading || cooldownLeft > 0;

  const onClick = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    setRateLimited(false);
    let success = false;
    try {
      const resp = await fetch(KIND_ENDPOINT[kind], {
        method: 'GET',
        headers: { Accept: '*/*' },
        cache: 'no-store',
      });
      if (!resp.ok) {
        if (resp.status === 401) {
          window.location.assign(
            '/login?callbackUrl=' + encodeURIComponent('/area-membri/prodotti'),
          );
          return;
        }
        if (resp.status === 429) {
          setRateLimited(true);
          setError(
            'Per proteggere il servizio puoi scaricare questo file al massimo 3 volte ogni ora. Riprova più tardi.',
          );
          return;
        }
        const payload = (await resp
          .json()
          .catch(() => ({}))) as { error?: string };
        throw new Error(
          payload.error ||
            'Impossibile scaricare il file. Riprova tra qualche istante.',
        );
      }
      const blob = await resp.blob();
      const disposition = resp.headers.get('Content-Disposition');
      let filename = KIND_FILENAME_HINT[kind];
      if (disposition) {
        const m = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
        const plain = /filename="([^"]+)"/i.exec(disposition);
        if (m?.[1]) filename = decodeURIComponent(m[1]);
        else if (plain?.[1]) filename = plain[1];
      }
      const url = URL.createObjectURL(blob);
      try {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.rel = 'noopener';
        document.body.appendChild(a);
        a.click();
        a.remove();
      } finally {
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
      success = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto.');
    } finally {
      setLoading(false);
      if (success) startCooldown();
    }
  }, [kind, disabled, startCooldown]);

  const variantClass =
    variant === 'primary'
      ? 'w-full flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-left sm:text-left text-center text-white transition-all duration-200 border border-[#1a6b4a]/70 shadow-[0_0_24px_rgba(11,85,58,0.25)] hover:shadow-[0_0_32px_rgba(13,94,64,0.45)]'
      : 'btn-ghost w-full flex-col sm:flex-row sm:items-start sm:justify-between gap-3 text-left border border-av-line hover:border-av-green-deep/40';

  const primaryBgClass =
    variant === 'primary'
      ? 'bg-[#0B3D2A] hover:bg-[#0F5238]'
      : '';

  const badgeLabel = cooldownLeft > 0
    ? `ATTENDI ${cooldownLeft}s`
    : 'DOWNLOAD';

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-busy={loading}
        className={`${variantClass} ${primaryBgClass} !py-3 !px-4 sm:!py-4 sm:!px-5 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <div className="flex items-start sm:items-start items-center sm:justify-start justify-center gap-3 min-w-0 w-full sm:w-auto">
          <span
            className={`grid h-9 w-9 flex-none place-items-center rounded-xl border ${
              variant === 'primary'
                ? 'border-[#1a6b4a]/60 bg-[#08281c] text-white'
                : 'border-av-green-deep/40 bg-av-green/10 text-av-green'
            }`}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0 text-left sm:text-left text-center">
            <p className="font-semibold text-white text-sm sm:text-base">
              {label}
            </p>
            {subLabel ? (
              <p
                className={`mt-0.5 text-xs leading-relaxed ${
                  variant === 'primary' ? 'text-white/85' : 'text-av-muted/90'
                }`}
              >
                {subLabel}
              </p>
            ) : null}
          </div>
        </div>
        <span
          className={`flex-none inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider sm:w-auto w-full sm:max-w-none max-w-[220px] mx-auto sm:mx-0 ${
            variant === 'primary'
              ? 'border-[#1a6b4a]/60 bg-[#08281c]/90 text-white'
              : 'border-white/10 text-white/90'
          }`}
        >
          {cooldownLeft > 0 ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5" />
          )}
          {badgeLabel}
        </span>
      </button>
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs sm:text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" />
          <div className="min-w-0">
            <p className="font-semibold">
              {rateLimited ? 'Limite temporaneo raggiunto' : 'Download non riuscito'}
            </p>
            <p className="mt-1 leading-relaxed break-words">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
