'use client';

import { useState } from 'react';

interface Props {
  frontSrc: string;
  backSrc: string;
  alt?: string;
  className?: string;
}

/**
 * Biglietto con flip 3D leggero in puro CSS.
 * Un solo stato locale: nessuna animazione continua, nessuna libreria,
 * utilizzabile anche da smartphone con un semplice tocco.
 */
export default function LiveEventTicketFlip({
  frontSrc,
  backSrc,
  alt = 'Biglietto evento',
  className = '',
}: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={className}>
      <div className="[perspective:1400px]">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-pressed={flipped}
          aria-label={flipped ? 'Mostra il fronte del biglietto' : 'Mostra il retro del biglietto'}
          className="block w-full aspect-[16/9] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A961]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-av-bg rounded-2xl"
        >
          <div
            className="relative h-full w-full transition-transform duration-500 ease-out [transform-style:preserve-3d]"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-[#C9A961]/40 shadow-[0_0_40px_rgba(201,169,97,0.28)] [backface-visibility:hidden]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={frontSrc}
                alt={`${alt} - fronte`}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
            <div
              className="absolute inset-0 overflow-hidden rounded-2xl border border-[#C9A961]/40 shadow-[0_0_40px_rgba(201,169,97,0.28)] [backface-visibility:hidden]"
              style={{ transform: 'rotateY(180deg)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={backSrc}
                alt={`${alt} - retro`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-av-muted">Tocca il biglietto per girarlo.</p>
    </div>
  );
}
