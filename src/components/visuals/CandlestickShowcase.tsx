'use client';

import { useEffect, useState, useRef, useCallback, useId } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

type SceneId = 'bull' | 'bear' | 'side';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Scene {
  id: SceneId;
  label: string;
  description: string;
  candles: Candle[];
  gridColor: string;
  accent: string;
  accent2: string;
  note: string;
}

const WIDTH = 900;
const HEIGHT = 340;
const PAD_L = 44;
const PAD_R = 20;
const PAD_T = 36;
const PAD_B = 48;

function buildBull(): Candle[] {
  const seeds = [
    [100, 106, 98, 104],
    [104, 108, 101, 107],
    [107, 112, 105, 110],
    [110, 111, 106, 108],
    [108, 114, 106, 113],
    [113, 120, 111, 118],
    [118, 124, 116, 122],
    [122, 123, 118, 120],
    [120, 128, 119, 126],
    [126, 133, 124, 131],
    [131, 138, 129, 136],
    [136, 142, 134, 140],
    [140, 145, 138, 143],
    [143, 150, 141, 148],
    [148, 156, 146, 154],
    [154, 162, 152, 160],
    [160, 166, 158, 164],
    [164, 171, 162, 169],
    [169, 174, 167, 172],
    [172, 179, 170, 177],
  ];
  return seeds.map(([o, h, l, c]) => ({ open: o, high: h, low: l, close: c }));
}

function buildBear(): Candle[] {
  const seeds = [
    [175, 178, 170, 172],
    [172, 175, 168, 170],
    [170, 171, 163, 166],
    [166, 169, 162, 164],
    [164, 166, 158, 160],
    [160, 164, 156, 158],
    [158, 161, 152, 155],
    [155, 158, 150, 152],
    [152, 155, 148, 150],
    [150, 152, 143, 146],
    [146, 149, 140, 142],
    [142, 144, 136, 138],
    [138, 141, 132, 135],
    [135, 137, 129, 131],
    [131, 133, 125, 128],
    [128, 130, 122, 124],
    [124, 126, 119, 121],
    [121, 123, 115, 118],
    [118, 120, 112, 114],
    [114, 116, 109, 111],
  ];
  return seeds.map(([o, h, l, c]) => ({ open: o, high: h, low: l, close: c }));
}

function buildSide(): Candle[] {
  const seeds = [
    [130, 133, 128, 131],
    [131, 134, 129, 132],
    [132, 134, 129, 130],
    [130, 133, 128, 132],
    [132, 135, 130, 133],
    [133, 135, 130, 131],
    [131, 134, 129, 132],
    [132, 134, 128, 130],
    [130, 133, 128, 131],
    [131, 134, 129, 133],
    [133, 135, 130, 132],
    [132, 134, 128, 130],
    [130, 133, 127, 131],
    [131, 134, 129, 133],
    [133, 135, 130, 132],
    [132, 134, 128, 130],
    [130, 133, 128, 131],
    [131, 134, 129, 132],
    [132, 135, 129, 133],
    [133, 135, 130, 132],
  ];
  return seeds.map(([o, h, l, c]) => ({ open: o, high: h, low: l, close: c }));
}

const scenes: Scene[] = [
  {
    id: 'bull',
    label: 'Trend rialzista',
    description:
      'Struttura composta da minimi e massimi crescenti, conferme e pullback controllati. Scenario formativo per riconoscere continuità e contesto.',
    candles: buildBull(),
    gridColor: '#0a2414',
    accent: '#00ff6a',
    accent2: '#7dffb4',
    note: 'Corpo verde = chiusura > apertura.',
  },
  {
    id: 'bear',
    label: 'Trend ribassista',
    description:
      'Struttura con massimi e minimi decrescenti, reiezioni ai livelli e accelerazioni al ribasso. Scenario formativo per riconoscere debolezza e invalidazioni.',
    candles: buildBear(),
    gridColor: '#261317',
    accent: '#ff6b85',
    accent2: '#ffa0b3',
    note: 'Corpo rosso = chiusura < apertura.',
  },
  {
    id: 'side',
    label: 'Lateralizzazione',
    description:
      'Range ben definito tra supporto e resistenza, senza direzione chiara. Scenario formativo per gestire attesa, qualità del break e false rotture.',
    candles: buildSide(),
    gridColor: '#182319',
    accent: '#00ff6a',
    accent2: '#c4f3d2',
    note: 'Nessuna direzione chiara = attesa e contesto.',
  },
];

function rangeOf(candles: Candle[]): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  const pad = (max - min) * 0.18 || 1;
  return [min - pad, max + pad];
}

export default function CandlestickShowcase() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const rootId = useId();
  const tabId = (i: number) => `${rootId}-tab-${i}`;
  const panelId = (i: number) => `${rootId}-panel-${i}`;

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = () => setReduced(mql.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const go = useCallback((next: number) => {
    setIdx(((next % scenes.length) + scenes.length) % scenes.length);
  }, []);

  useEffect(() => {
    if (reduced || paused) return;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => go(idx + 1), 4500);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [reduced, paused, idx, go]);

  const current = scenes[idx];
  const [yMin, yMax] = rangeOf(current.candles);
  const plotW = WIDTH - PAD_L - PAD_R;
  const plotH = HEIGHT - PAD_T - PAD_B;
  const candleW = plotW / current.candles.length;
  const bodyW = Math.max(2, candleW * 0.62);

  const yFor = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH;

  const yTicks = 5;
  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);
  const gradId = `${rootId}-grad-${current.id}`;

  return (
    <GlassCard className="overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/50 bg-av-green/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-av-green">
            Visualizzazione scenari di mercato
          </p>
          <h3 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl">
            Tre scenari per allenare l&apos;occhio sul prezzo
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
            {current.description}
          </p>
        </div>

        <div
          className="flex items-center gap-2 md:flex-none"
          role="tablist"
          aria-label="Scenari di mercato"
        >
          {scenes.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              id={tabId(i)}
              aria-selected={i === idx}
              aria-controls={panelId(i)}
              onClick={() => {
                go(i);
                setPaused(true);
                window.setTimeout(() => setPaused(false), 9000);
              }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              className={`min-h-[44px] whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-semibold transition-all sm:text-sm ${
                i === idx
                  ? 'border-av-green-deep bg-av-green/10 text-av-green shadow-glow-green-sm'
                  : 'border-av-line bg-av-bg-2/50 text-av-muted hover:text-white hover:border-av-green-deep/60'
              }`}
            >
              {s.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="grid h-10 w-10 place-items-center rounded-full border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
            aria-label={paused ? 'Riprendi animazione scenari' : 'Metti in pausa animazione scenari'}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        className="mt-6"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true);
          touchStartX.current = e.touches[0].clientX;
        }}
        onTouchMove={(e) => {
          if (touchStartX.current == null) return;
          const dx = e.touches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 48) {
            go(dx < 0 ? idx + 1 : idx - 1);
            touchStartX.current = null;
          }
        }}
        onTouchEnd={() => {
          touchStartX.current = null;
          window.setTimeout(() => setPaused(false), 4500);
        }}
      >
        <div
          role="tabpanel"
          id={panelId(idx)}
          aria-labelledby={tabId(idx)}
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-av-line bg-av-bg-2"
        >
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="h-full w-full"
            preserveAspectRatio="none"
            role="img"
            aria-label={`Grafico a candele giapponesi: ${current.label}`}
          >
            <defs>
              <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={current.accent} stopOpacity="0.20" />
                <stop offset="100%" stopColor={current.accent} stopOpacity="0" />
              </linearGradient>
              <filter id={`${rootId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#050705" />

            <g opacity="0.5">
              {ticks.map((t, i) => (
                <line
                  key={i}
                  x1={PAD_L}
                  x2={WIDTH - PAD_R}
                  y1={yFor(t)}
                  y2={yFor(t)}
                  stroke={current.gridColor}
                  strokeWidth={1}
                />
              ))}
              {Array.from({ length: 9 }).map((_, i) => {
                const x = PAD_L + ((WIDTH - PAD_L - PAD_R) / 9) * i;
                return (
                  <line
                    key={`v${i}`}
                    x1={x}
                    x2={x}
                    y1={PAD_T}
                    y2={HEIGHT - PAD_B}
                    stroke={current.gridColor}
                    strokeWidth={1}
                    opacity={0.6}
                  />
                );
              })}
            </g>

            {current.candles.map((c, i) => {
              const x = PAD_L + i * candleW + candleW / 2;
              const yO = yFor(c.open);
              const yC = yFor(c.close);
              const yH = yFor(c.high);
              const yL = yFor(c.low);
              const up = c.close >= c.open;
              const color = up ? current.accent : '#ff5a6f';
              const bodyTop = Math.min(yO, yC);
              const bodyH = Math.max(1, Math.abs(yC - yO));
              const cxLeft = x - bodyW / 2;
              return (
                <g key={i}>
                  <line
                    x1={x}
                    x2={x}
                    y1={yH}
                    y2={yL}
                    stroke={color}
                    strokeWidth={1.2}
                    opacity={0.95}
                  />
                  <rect
                    x={cxLeft}
                    y={bodyTop}
                    width={bodyW}
                    height={bodyH}
                    fill={up ? color : '#1b0a0d'}
                    stroke={color}
                    strokeWidth={1.2}
                    rx={1.2}
                    opacity={1}
                    style={
                      reduced
                        ? undefined
                        : {
                            transformOrigin: `${cxLeft + bodyW / 2}px ${bodyTop + bodyH / 2}px`,
                            transform: `scaleY(0)`,
                            animation: `cvScale 0.55s cubic-bezier(0.2, 0.7, 0.2, 1) ${0.015 * i}s forwards`,
                          }
                    }
                  />
                </g>
              );
            })}

            <line
              x1={PAD_L}
              x2={WIDTH - PAD_R}
              y1={HEIGHT - PAD_B}
              y2={HEIGHT - PAD_B}
              stroke="rgba(255,255,255,0.05)"
            />

            {ticks.map((t, i) => (
              <text
                key={`yt${i}`}
                x={PAD_L - 10}
                y={yFor(t) + 3}
                fontSize="10"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                textAnchor="end"
                fill={current.accent2}
                opacity={0.8}
              >
                {t.toFixed(0)}
              </text>
            ))}

            <g transform={`translate(${PAD_L}, ${PAD_T + 8})`} opacity={reduced ? 1 : 0.6} style={reduced ? undefined : { animation: 'fadeIn 1s ease forwards' }}>
              <rect width={178} height={54} rx={10} fill="#000" fillOpacity={0.55} stroke={current.accent} strokeOpacity={0.55} />
              <text x={14} y={22} fontSize="10" letterSpacing="1.4" fill={current.accent} fontFamily="ui-monospace, Menlo, monospace">
                SCENARIO · {current.label.toUpperCase()}
              </text>
              <text x={14} y={41} fontSize="11" fill="#ffffff" fontFamily="ui-monospace, Menlo, monospace">
                {current.note}
              </text>
            </g>
          </svg>
          <style>{`@keyframes cvScale { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(idx - 1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
              aria-label="Scenario precedente"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(idx + 1)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
              aria-label="Scenario successivo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="ml-2 flex items-center gap-1.5">
              {scenes.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Vai a scenario ${i + 1}`}
                  aria-current={i === idx}
                  className={`h-2 rounded-full transition-all ${
                    i === idx ? 'w-8 bg-av-green' : 'w-2 bg-av-line hover:bg-av-green-deep/70'
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg-2/60 px-3 py-1.5 text-xs text-av-muted sm:text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-av-green/80" />
            Rappresentazione a scopo illustrativo
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
