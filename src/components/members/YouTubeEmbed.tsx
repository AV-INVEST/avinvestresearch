'use client';

import { useMemo, useState } from 'react';
import { Play, ShieldAlert, Cookie, Clock } from 'lucide-react';
import { useCookieConsent } from '@/components/cookie/CookieConsentContext';

interface Props {
  youtubeId?: string;
  lessonTitle: string;
  startSec?: number;
  onTimeUpdate?: (sec: number, progressPct: number | null) => void;
  onPause?: (sec: number, progressPct: number | null) => void;
  durationSec?: number;
}

export default function YouTubeEmbed({ youtubeId, lessonTitle, startSec, onTimeUpdate, onPause, durationSec }: Props) {
  const { state, setOpen } = useCookieConsent();
  const [showIframe, setShowIframe] = useState(false);
  const consentGiven =
    state.timestamp > 0 &&
    (state.categories.analitici || state.categories.marketing);

  const iframeTitle = useMemo(() => {
    const base = lessonTitle ? `${lessonTitle} - ` : '';
    return `${base}Video YouTube`;
  }, [lessonTitle]);

  if (!youtubeId) {
    return (
      <div className="aspect-video w-full rounded-2xl border border-dashed border-av-line bg-av-bg-2/60 grid place-items-center">
        <div className="px-6 text-center">
          <p className="text-sm font-medium text-av-muted">
            Video non ancora disponibile
          </p>
          <p className="mt-2 text-xs text-av-muted/80">
            Torna pi&ugrave; tardi per vedere questa lezione.
          </p>
        </div>
      </div>
    );
  }

  const canShow = showIframe || consentGiven;

  if (!canShow) {
    return (
      <div className="aspect-video w-full rounded-2xl border border-av-line bg-av-bg-2/80 overflow-hidden relative isolate">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_60%)]" />
        <div className="relative z-10 h-full w-full grid place-items-center p-5">
          <div className="max-w-xl rounded-2xl border border-av-line bg-av-surface/80 backdrop-blur-xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
                <ShieldAlert className="h-5 w-5 text-av-green" />
              </span>
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-white">
                  Contenuto esterno YouTube
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-av-muted">
                  Questo video &egrave; ospitato su YouTube (Google) tramite il
                  dominio privacy friendly <code className="font-mono text-av-green">youtube-nocookie.com</code>.
                  Per caricarlo puoi accettare i cookie analitici e marketing
                  dalle preferenze oppure confermare manualmente con il
                  pulsante Play.
                </p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowIframe(true)}
                    className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
                  >
                    <Play className="h-4 w-4" />
                    Play e carica video
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(true, true)}
                    className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                  >
                    <Cookie className="h-4 w-4 text-av-green" />
                    Gestisci preferenze cookie
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeStart = Math.max(0, Math.floor(startSec ?? 0));
  const iframeSrcParams = new URLSearchParams({ rel: '0' });
  if (safeStart > 0) iframeSrcParams.set('start', String(safeStart));
  if (onTimeUpdate || onPause) iframeSrcParams.set('enablejsapi', '1');
  const iframeSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId!)}?${iframeSrcParams.toString()}`;

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-av-line bg-black">
      {showIframe ? (
        <iframe
          className="h-full w-full"
          src={iframeSrc}
          title={iframeTitle}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="no-referrer"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowIframe(true)}
          className="group relative h-full w-full overflow-hidden bg-black grid place-items-center focus-visible:outline-none"
          aria-label={`Riproduci: ${iframeTitle}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.12),transparent_65%)]" />
          <span className="relative z-10 grid h-16 w-16 place-items-center rounded-full border border-av-green-deep/60 bg-av-green/10 text-av-green shadow-glow-green transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20">
            <Play className="h-7 w-7 translate-x-[2px] sm:h-9 sm:w-9" />
          </span>
          {safeStart > 0 ? (
            <div className="pointer-events-none absolute inset-x-0 top-0 p-4 sm:p-5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-bg-2/80 px-2.5 py-1 text-[11px] font-semibold text-av-green backdrop-blur">
                <Clock className="h-3 w-3" />
                Riprendi da {Math.floor(safeStart / 60)}:{(safeStart % 60).toString().padStart(2, '0')}
              </span>
            </div>
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="max-w-3xl truncate text-xs text-white/80 sm:text-sm">
              {lessonTitle || 'Lezione'}
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
