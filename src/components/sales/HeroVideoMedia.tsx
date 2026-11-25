'use client';

import { useState, type ReactNode } from 'react';
import { Play, ShieldAlert, Cookie } from 'lucide-react';
import { useSales } from '@/lib/sales/sales-client';
import { parseYouTubeId } from '@/lib/sales/sales-shared';
import { useCookieConsent } from '@/components/cookie/CookieConsentContext';

/**
 * Copia locale (ottimizzata) della miniatura dell'attuale video Hero, servita
 * dal nostro dominio per non contattare i.ytimg.com prima del Play.
 * È legata all'ID video indicato: se l'amministratore configura un video
 * diverso, questa copia non corrisponderebbe più e non viene mostrata
 * (resta il fallback grafico).
 */
const HERO_VIDEO_THUMB_ID = 'C-thoAmS1Qs';
const HERO_VIDEO_THUMB_SRC = '/images/hero-video-thumb.webp';

/**
 * Sostituisce il riquadro decorativo "AV MARKET VIEW" della Hero con il video
 * testimonianze configurato dall'amministratore.
 *
 * - Senza video valido o con switch OFF mostra il `fallback` (grafico originale).
 * - Nessuna richiesta a servizi esterni prima del clic: la copertina è una
 *   copia locale della miniatura oppure, in mancanza, un fallback grafico.
 * - Al clic carica il player da `youtube-nocookie.com`, restando nel sito.
 */
export default function HeroVideoMedia({ fallback }: { fallback: ReactNode }) {
  const { heroVideo } = useSales();
  const videoId = heroVideo.enabled ? parseYouTubeId(heroVideo.url) : null;

  if (!videoId) return <>{fallback}</>;

  return <HeroVideoPanel videoId={videoId} title={heroVideo.title} />;
}

function HeroVideoPanel({ videoId, title }: { videoId: string; title: string }) {
  const { state, setOpen } = useCookieConsent();
  const [playing, setPlaying] = useState(false);
  // Se la copia locale non è disponibile si ricade sul fallback grafico.
  const [thumbBroken, setThumbBroken] = useState(false);
  const consentGiven =
    state.timestamp > 0 && (state.categories.analitici || state.categories.marketing);

  const thumbSrc =
    videoId === HERO_VIDEO_THUMB_ID && !thumbBroken ? HERO_VIDEO_THUMB_SRC : null;

  const iframeSrc = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    videoId,
  )}?rel=0&autoplay=1`;

  return (
    <div className="relative mx-auto w-full max-w-[560px] animate-fade-in [animation-delay:400ms]">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-av-green/20 via-transparent to-av-green/10 opacity-70 blur-2xl" />
      <div className="relative glass-card overflow-hidden p-3 sm:p-4">
        <div className="flex items-center justify-between rounded-xl border border-av-line bg-av-bg-2/70 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-av-green shadow-glow-green-sm" />
            <span className="font-mono text-[11px] uppercase tracking-widest text-av-muted sm:text-xs">
              AV · IL PROGETTO IN 2 MINUTI
            </span>
          </div>
        </div>

        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-xl border border-av-line bg-av-bg-2">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={iframeSrc}
              title={title || 'Video testimonianze'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 grid place-items-center focus-visible:outline-none"
              aria-label={`Riproduci il video: ${title || 'Video testimonianze'}`}
            >
              {thumbSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setThumbBroken(true)}
                />
              ) : null}
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/45"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.14),transparent_65%)]"
              />
              <span
                aria-hidden="true"
                className={`absolute inset-0 ${thumbSrc ? 'opacity-15' : 'opacity-25'}`}
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,255,106,0.12) 0px, transparent 1px, transparent 22px), repeating-linear-gradient(90deg, rgba(0,255,106,0.08) 0px, transparent 1px, transparent 22px)',
                }}
              />
              <span className="relative z-10 grid h-16 w-16 place-items-center rounded-full border border-av-green-deep/60 bg-av-green/10 text-av-green shadow-glow-green transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20">
                <Play className="h-7 w-7 translate-x-[2px] sm:h-9 sm:w-9" />
              </span>
              <span className="pointer-events-none absolute inset-x-0 bottom-0 z-10 block p-4 text-left sm:p-5">
                <span className="block font-display text-base font-semibold text-white sm:text-lg">
                  {title || 'Video testimonianze'}
                </span>
              </span>
            </button>
          )}
        </div>

        {!playing ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] leading-relaxed text-av-muted">
            <ShieldAlert className="h-3.5 w-3.5 flex-none text-av-green" />
            <span aria-hidden="true">Video ospitato su YouTube</span>
            <span className="sr-only">
              Premendo Play carichi un contenuto esterno da YouTube
              (youtube-nocookie.com).
            </span>
            {!consentGiven ? (
              <button
                type="button"
                onClick={() => setOpen(true, true)}
                className="inline-flex items-center gap-1 font-semibold text-av-green hover:underline"
              >
                <Cookie className="h-3.5 w-3.5" />
                Preferenze cookie
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
