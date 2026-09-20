'use client';

import { useCallback, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileCode,
  FileText,
  Loader2,
} from 'lucide-react';

type Kind = 'indicator' | 'guide';

const KIND_ENDPOINT: Record<Kind, string> = {
  indicator: '/api/products/market-lens/download/indicator',
  guide: '/api/products/market-lens/download/guide',
};

const KIND_FILENAME_HINT: Record<Kind, string> = {
  indicator: 'AV-Market-Lens.pine',
  guide: 'AV-Market-Lens-Guida.pdf',
};

const KIND_ICON: Record<Kind, typeof FileCode> = {
  indicator: FileCode,
  guide: FileText,
};

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

  const onClick = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto.');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  const variantClass =
    variant === 'primary'
      ? 'btn-primary w-full items-start justify-between gap-3 text-left shadow-glow-green-sm'
      : 'btn-ghost w-full items-start justify-between gap-3 text-left border border-av-line hover:border-av-green-deep/40';

  return (
    <div className={`w-full space-y-2 ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        aria-busy={loading}
        className={`${variantClass} !py-3 !px-4 sm:!py-4 sm:!px-5 disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-white text-sm sm:text-base">
              {label}
            </p>
            {subLabel ? (
              <p className="mt-0.5 text-xs text-av-muted/90 leading-relaxed">
                {subLabel}
              </p>
            ) : null}
          </div>
        </div>
        <span className="flex-none inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/90 self-center">
          <Download className="h-3.5 w-3.5" />
          DOWNLOAD
        </span>
      </button>
      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/5 px-3 py-2 text-xs sm:text-sm text-red-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none text-red-400" />
          <div className="min-w-0">
            <p className="font-semibold">Download non riuscito</p>
            <p className="mt-1 leading-relaxed break-words">{error}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
