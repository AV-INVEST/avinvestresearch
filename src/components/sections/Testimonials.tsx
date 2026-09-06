'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { Quote, ChevronLeft, ChevronRight, UserRound, Pause, Play, Star } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { siteConfig } from '@/config/siteConfig';

export default function Testimonials() {
  const items = siteConfig.testimonials;
  const [idx, setIdx] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const idRoot = useId();

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const h = () => setReduced(mql.matches);
    mql.addEventListener?.('change', h);
    return () => mql.removeEventListener?.('change', h);
  }, []);

  const go = useCallback(
    (next: number) => {
      setIdx(((next % items.length) + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (reduced || paused) {
      if (timer.current) {
        window.clearInterval(timer.current);
        timer.current = null;
      }
      return;
    }
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => go(idx + 1), 6200);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [reduced, paused, idx, go, items.length]);

  const it = items[idx];

  return (
    <section
      id="feedback"
      className="relative py-24 sm:py-32 scroll-mt-28"
      aria-labelledby="feedback-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.06),transparent_55%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Feedback pubblico</p>
          <h2 id="feedback-heading" className="mt-5 heading-lg">
            Opinioni reali, <span className="text-av-green">anonime e senza artifizi</span>
          </h2>
          <p className="mt-5 body-lg">
            Commenti pubblici di chi segue il progetto. Non sono recensioni di acquisto e
            non implicano alcuna correlazione con risultati di investimento.
          </p>
        </div>

        <div
          className="mx-auto mt-12 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={(e) => {
            setPaused(true);
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchMove={(e) => {
            if (touchStartX.current == null) return;
            const dx = e.touches[0].clientX - touchStartX.current;
            if (Math.abs(dx) > 52) {
              go(dx < 0 ? idx + 1 : idx - 1);
              touchStartX.current = null;
            }
          }}
          onTouchEnd={() => {
            touchStartX.current = null;
            window.setTimeout(() => setPaused(false), 5500);
          }}
        >
          <GlassCard className="overflow-hidden p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-av-green/90">
                <Quote className="h-5 w-5 sm:h-6 sm:w-6" />
                <div className="h-px w-12 bg-av-green/40 sm:w-20" />
              </div>
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="grid h-10 w-10 place-items-center rounded-full border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
                aria-label={paused ? 'Riprendi rotazione testimonianze' : 'Metti in pausa rotazione testimonianze'}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative mt-6">
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ contain: 'layout paint' }}
              >
                <ul
                  className="flex"
                  style={{
                    width: `${items.length * 100}%`,
                    transform: `translateX(${-idx * (100 / items.length)}%)`,
                    transition: reduced ? 'none' : 'transform 0.7s cubic-bezier(0.2, 0.7, 0.2, 1)',
                  }}
                >
                  {items.map((t, i) => (
                    <li
                      key={t.id}
                      role="group"
                      aria-roledescription="slide"
                      aria-hidden={i !== idx}
                      aria-label={`Testimonianza ${i + 1} di ${items.length}`}
                      id={`${idRoot}-slide-${i}`}
                      className="flex-none px-1 sm:px-2"
                      style={{ width: `${100 / items.length}%` }}
                    >
                      <blockquote className="rounded-2xl border border-av-line bg-av-bg-2/50 p-4 sm:p-5">
                        <div
                          className={`mb-3 flex gap-1 ${reduced ? '' : 'transition-[opacity,transform] duration-500 ease-out'}`}
                          style={reduced ? undefined : { opacity: i === idx ? 1 : 0, transform: i === idx ? 'translateY(0)' : 'translateY(-6px)' }}
                        >
                          {[0, 1, 2, 3, 4].map((n) => (
                            <Star
                              key={n}
                              aria-hidden="true"
                              className="h-4 w-4 text-av-green drop-shadow-[0_0_4px_rgba(0,255,106,0.55)]"
                            />
                          ))}
                        </div>
                        <p className="text-base leading-relaxed text-white sm:text-lg">
                          &ldquo;{t.text}&rdquo;
                        </p>
                        <footer className="mt-4 sm:mt-5 flex items-center gap-3">
                          <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-av-green-deep/50 bg-av-green/10 text-av-green">
                            <UserRound className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{t.author}</p>
                            <p className="text-xs text-av-muted">Pubblico · anonimizzato</p>
                          </div>
                        </footer>
                      </blockquote>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2" role="tablist" aria-label="Punti testimonianze">
                <button
                  type="button"
                  onClick={() => go(idx - 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
                  aria-label="Testimonianza precedente"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(idx + 1)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
                  aria-label="Testimonianza successiva"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="ml-2 flex items-center gap-1.5">
                  {items.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === idx}
                      aria-controls={`${idRoot}-slide-${i}`}
                      onClick={() => go(i)}
                      aria-label={`Vai a testimonianza ${i + 1}`}
                      className={`h-2 rounded-full transition-all ${
                        i === idx
                          ? 'w-8 bg-av-green shadow-glow-green-sm'
                          : 'w-2 bg-av-line hover:bg-av-green-deep/70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-av-muted sm:text-sm">
                Scorri con un gesto o usa i controlli. Auto-rotazione:{' '}
                <span className={paused || reduced ? 'text-av-muted' : 'text-av-green'}>
                  {paused || reduced ? 'in pausa' : 'attiva'}
                </span>
                .
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
