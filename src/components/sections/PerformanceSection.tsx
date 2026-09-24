'use client';

import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Wallet, LineChart, AlertTriangle } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import { siteConfig } from '@/config/siteConfig';
import LastUpdatedLabel from '@/components/ui/LastUpdatedLabel';

type Entry = (typeof siteConfig.performance.entries)[number];

const iconFor = (e: Entry) => {
  switch (e.id) {
    case '2024h':
    case '2025f':
      return LineChart;
    case 'copiers':
      return Users;
    case 'aum':
      return Wallet;
    default:
      return TrendingUp;
  }
};

function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current || inView) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25, ...options },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [inView, options]);
  return { ref, inView };
}

function AnimatedNumber({
  target,
  decimals = 0,
  suffix = '',
  prefix = '',
  reduced,
  force,
  displayValue,
}: {
  target: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  reduced: boolean;
  force: boolean;
  displayValue?: string;
}) {
  const [value, setValue] = useState(0);
  const mounted = useRef(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!force) return;
    if (displayValue) {
      setValue(target);
      return;
    }
    if (reduced) {
      setValue(target);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const from = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, reduced, force, displayValue]);

  useEffect(() => {
    mounted.current = true;
  }, []);

  const text = displayValue
    ? displayValue
    : `${prefix}${value.toLocaleString('it-IT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

  return (
    <span
      className="font-display font-semibold tracking-tight text-white tabular-nums"
      aria-label={`${prefix}${target.toLocaleString('it-IT', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`}
    >
      {text}
    </span>
  );
}
export default function PerformanceSection() {
  const [reduced, setReduced] = useState(false);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const h = () => setReduced(mql.matches);
    mql.addEventListener?.('change', h);
    return () => mql.removeEventListener?.('change', h);
  }, []);

  return (
    <section
      id="performance"
      className="relative py-14 sm:py-32 scroll-mt-28"
      aria-labelledby="performance-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.07),transparent_60%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">
            <TrendingUp className="h-3.5 w-3.5" />
            Dati pubblici
          </p>
          <h2 id="performance-heading" className="mt-5 heading-lg">
            Un metodo costruito <span className="text-av-green">sui risultati</span>
          </h2>
          <p className="mt-5 body-lg">
            Risultati del portafoglio pubblico AV-INVEST, rilevati e riportati senza
            artifici. Servono a mostrare l&apos;applicazione del metodo, non a promettere
            performance future.
          </p>
        </div>

        <div ref={ref} className="mt-9 sm:mt-14">
          <GlassCard className="overflow-hidden p-5 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {siteConfig.performance.entries.map((e) => {
                const Icon = iconFor(e);
                const isPercent = e.suffix === '%';
                return (
                  <div
                    key={e.id}
                    className="group relative overflow-hidden rounded-2xl border border-av-line bg-av-bg-2/60 p-5 transition-colors hover:border-av-green-deep/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green transition-all group-hover:shadow-glow-green-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      {isPercent ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                            e.positive
                              ? 'bg-av-green/10 text-av-green'
                              : 'bg-red-500/10 text-red-300'
                          }`}
                        >
                          {e.positive ? 'Positivo' : 'Dato'}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-5">
                      <div className="flex items-baseline gap-1 text-3xl sm:text-4xl">
                        <AnimatedNumber
                          target={e.value}
                          decimals={e.suffix === '%' ? 2 : 0}
                          suffix={e.suffix}
                          prefix={isPercent && e.positive ? '+' : ''}
                          reduced={reduced}
                          force={inView || reduced}
                          displayValue={'displayValue' in e ? (e as { displayValue?: string }).displayValue : undefined}
                        />
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
                        {e.label}
                      </p>
                    </div>
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-av-green/10 blur-3xl transition-opacity group-hover:opacity-90 opacity-60"
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-av-green-deep/30 bg-av-green/[0.04] p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-av-green/10 text-av-green">
                  <AlertTriangle className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-white sm:text-lg">
                    {siteConfig.performance.disclaimer}
                  </p>
                  <p className="mt-2 text-xs text-av-muted sm:text-sm">
                    <LastUpdatedLabel prefix="Dati del portafoglio pubblico AV-INVEST, rilevati il " suffix="." />
                  </p>
                </div>
              </div>
              <div className="flex-none">
                <span className="inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg/60 px-3 py-1.5 text-xs text-av-muted sm:text-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-av-green/80" />
                  Valori statici, nessun collegamento live al conto
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
