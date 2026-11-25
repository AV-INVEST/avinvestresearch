'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Carosello leggero e riutilizzabile, attivo solo su mobile.
 *
 * - Scroll nativo con `scroll-snap`: nessuna libreria esterna, nessun polling.
 * - L'indice attivo è sincronizzato via `IntersectionObserver` sul contenitore,
 *   quindi funziona anche dopo uno swipe manuale.
 * - Da `sm` in su il viewport viene sostituito dal layout desktop passato in
 *   `smViewportClassName` (griglia o blocco): la sezione server resta invariata.
 */
export interface SwipeCarouselProps {
  /** Schede già renderizzate, nell'ordine di visualizzazione. */
  items: ReactNode[];
  /** Etichetta accessibile usata dai pallini di navigazione. */
  ariaLabel: string;
  /** Classi di ogni scheda (larghezza mobile con accenno della successiva). */
  itemClassName: string;
  /** Classi aggiuntive del viewport su mobile (es. `gap-2.5`). */
  viewportClassName?: string;
  /** Layout che sostituisce il carosello a partire dal breakpoint `sm`. */
  smViewportClassName?: string;
  /** Colore del pallino attivo. */
  activeDotClassName?: string;
}

export default function SwipeCarousel({
  items,
  ariaLabel,
  itemClassName,
  viewportClassName = '',
  smViewportClassName = 'sm:block',
  activeDotClassName = 'w-6 bg-av-green shadow-glow-green-sm',
}: SwipeCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  // Indice corrente in una ref: le frecce lo leggono in modo sincrono, quindi
  // click rapidi e consecutivi non perdono passaggi prima del re-render.
  const activeRef = useRef(0);
  // Indice impostato dalle frecce/pallini, in attesa che lo scorrimento si
  // assesti: finché è valorizzato l'observer ignora gli stati intermedi.
  const pendingRef = useRef<number | null>(null);

  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;
    const slides = Array.from(root.children) as HTMLElement[];
    if (slides.length === 0) return;

    const ratios = new Array<number>(slides.length).fill(0);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = slides.indexOf(entry.target as HTMLElement);
          if (index >= 0) ratios[index] = entry.intersectionRatio;
        }
        let bestIndex = 0;
        let bestRatio = -1;
        for (let i = 0; i < ratios.length; i += 1) {
          if (ratios[i] > bestRatio) {
            bestRatio = ratios[i];
            bestIndex = i;
          }
        }
        // Scorrimento programmato in corso: ignoriamo gli indici intermedi
        // finché non raggiunge la scheda target, così il pallino non "torna
        // indietro" per poi correggersi da solo.
        if (pendingRef.current !== null) {
          if (bestIndex !== pendingRef.current) return;
          pendingRef.current = null;
        }
        activeRef.current = bestIndex;
        setActive(bestIndex);
      },
      { root, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    // Rete di sicurezza: a ogni scorrimento concluso sblocchiamo l'observer,
    // così anche lo swipe manuale torna sempre a guidare i pallini.
    const clearPending = () => {
      pendingRef.current = null;
    };
    root.addEventListener('scrollend', clearPending);
    slides.forEach((slide) => observer.observe(slide));
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', clearPending);
    };
  }, [items.length]);

  const goTo = useCallback((index: number) => {
    const root = viewportRef.current;
    if (!root) return;
    const target = Math.max(0, Math.min(index, root.children.length - 1));
    if (target === activeRef.current) return;
    const slide = root.children[target] as HTMLElement | undefined;
    if (!slide) return;
    // Posizione della scheda calcolata rispetto al viewport scrollabile (non
    // alla pagina): nessuno scroll sui contenitori antenati, quindi nessuno
    // spostamento orizzontale della pagina.
    const left =
      root.scrollLeft + (slide.getBoundingClientRect().left - root.getBoundingClientRect().left);
    pendingRef.current = target;
    activeRef.current = target;
    setActive(target);
    // Scorrimento immediato (non `smooth`): elimina la corsa con lo
    // scroll-snap obbligatorio e con l'observer, causa di pallini instabili e
    // di frecce che sembravano non funzionare. Lo swipe manuale resta nativo.
    root.scrollTo({ left, behavior: 'auto' });
  }, []);

  const last = items.length - 1;

  return (
    <div className="w-full min-w-0">
      <div
        ref={viewportRef}
        className={`relative flex w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-hidden snap-x snap-mandatory pb-2 sm:pb-0 ${viewportClassName} ${smViewportClassName}`}
      >
        {items.map((item, index) => (
          <div key={index} className={`min-w-0 shrink-0 snap-start ${itemClassName}`}>
            {item}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-3 sm:hidden">
        <button
          type="button"
          onClick={() => goTo(activeRef.current - 1)}
          disabled={active === 0}
          aria-label="Scheda precedente"
          className="grid h-8 w-8 flex-none place-items-center rounded-full border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2" role="group" aria-label={ariaLabel}>
          {items.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Vai alla scheda ${index + 1} di ${items.length}`}
              aria-current={index === active ? 'true' : undefined}
              className={`h-2.5 rounded-full transition-colors ${
                index === active ? activeDotClassName : 'w-2.5 bg-av-line hover:bg-white/30'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => goTo(activeRef.current + 1)}
          disabled={active === last}
          aria-label="Scheda successiva"
          className="grid h-8 w-8 flex-none place-items-center rounded-full border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-white disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
