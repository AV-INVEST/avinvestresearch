'use client';

import { useState } from 'react';

type Side = 'front' | 'back';

interface Props {
  frontSrc: string;
  backSrc: string;
  title: string;
  className?: string;
}

/**
 * Switch Fronte/Retro per la copertina di "Oltre il Grafico".
 * Entrambe le immagini sono rese nel DOM e mostrate/nascoste via CSS:
 * il cambio è istantaneo e non genera nuove richieste dopo il primo load.
 * Nessuna libreria o animazione pesante.
 */
export default function OltreIlGraficoCoverSwitch({
  frontSrc,
  backSrc,
  title,
  className = '',
}: Props) {
  const [side, setSide] = useState<Side>('front');

  return (
    <div className={className}>
      <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[340px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,97,0.22),transparent_65%)] blur-xl"
        />
        <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-[#C9A961]/30 bg-av-bg-2/60 shadow-glow-gold">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frontSrc}
            alt={`Copertina fronte del romanzo ${title}`}
            width={680}
            height={1020}
            loading="eager"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              side === 'front' ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={backSrc}
            alt={`Copertina retro del romanzo ${title}`}
            width={680}
            height={1020}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              side === 'back' ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
      </div>

      <div
        role="group"
        aria-label="Vista copertina: fronte o retro"
        className="mx-auto mt-5 inline-flex w-full max-w-[300px] items-center gap-1 rounded-xl border border-av-line bg-av-bg-2/60 p-1 sm:max-w-[340px]"
      >
        <button
          type="button"
          onClick={() => setSide('front')}
          aria-pressed={side === 'front'}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            side === 'front'
              ? 'bg-[#C9A961]/15 text-[#E4CE96]'
              : 'text-av-muted hover:text-white'
          }`}
        >
          Fronte
        </button>
        <button
          type="button"
          onClick={() => setSide('back')}
          aria-pressed={side === 'back'}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            side === 'back'
              ? 'bg-[#C9A961]/15 text-[#E4CE96]'
              : 'text-av-muted hover:text-white'
          }`}
        >
          Retro
        </button>
      </div>
    </div>
  );
}
