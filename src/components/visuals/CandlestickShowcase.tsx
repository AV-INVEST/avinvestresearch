'use client';

import { useEffect, useRef, useState, useCallback, useId } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';

type SceneId = 'bull' | 'bear' | 'side';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

type AnnotationKind = 'zone' | 'breakout' | 'retest' | 'continuation' | 'resistance' | 'support';

interface Annotation {
  kind: AnnotationKind;
  label: string;
  x?: number;
  y?: number;
  y1?: number;
  y2?: number;
  x1?: number;
  x2?: number;
  align?: 'start' | 'center' | 'end';
  dir?: 'up' | 'down';
}

interface Scene {
  id: SceneId;
  label: string;
  shortLabel: string;
  description: string;
  summary: string;
  candles: Candle[];
  gridColor: string;
  accent: string;
  accent2: string;
  annotations: Annotation[];
}

const WIDTH = 900;
const HEIGHT = 360;
const PAD_L = 48;
const PAD_R = 24;
const PAD_T = 40;
const PAD_B = 54;

const BULL_CANDLES: Candle[] = [
  { open: 100, high: 102, low: 98, close: 101 },
  { open: 101, high: 103, low: 99, close: 100 },
  { open: 100, high: 104, low: 99, close: 103 },
  { open: 103, high: 105, low: 101, close: 104 },
  { open: 104, high: 106, low: 102, close: 103 },
  { open: 103, high: 109, low: 102, close: 108 },
  { open: 108, high: 110, low: 106, close: 107 },
  { open: 107, high: 109, low: 104, close: 105 },
  { open: 105, high: 108, low: 104, close: 107 },
  { open: 107, high: 110, low: 106, close: 109 },
  { open: 109, high: 118, low: 108, close: 117 },
  { open: 117, high: 120, low: 115, close: 116 },
  { open: 116, high: 119, low: 113, close: 114 },
  { open: 114, high: 118, low: 112, close: 117 },
  { open: 117, high: 120, low: 115, close: 119 },
  { open: 119, high: 124, low: 117, close: 123 },
  { open: 123, high: 128, low: 121, close: 127 },
  { open: 127, high: 131, low: 125, close: 130 },
  { open: 130, high: 136, low: 128, close: 135 },
  { open: 135, high: 141, low: 133, close: 140 },
];

const BEAR_CANDLES: Candle[] = [
  { open: 148, high: 150, low: 146, close: 149 },
  { open: 149, high: 151, low: 147, close: 148 },
  { open: 148, high: 150, low: 146, close: 147 },
  { open: 147, high: 149, low: 145, close: 148 },
  { open: 148, high: 150, low: 146, close: 149 },
  { open: 149, high: 151, low: 147, close: 147 },
  { open: 147, high: 149, low: 145, close: 146 },
  { open: 146, high: 148, low: 144, close: 147 },
  { open: 147, high: 149, low: 146, close: 148 },
  { open: 148, high: 149, low: 145, close: 146 },
  { open: 146, high: 147, low: 136, close: 138 },
  { open: 138, high: 141, low: 136, close: 140 },
  { open: 140, high: 144, low: 139, close: 143 },
  { open: 143, high: 146, low: 143, close: 145 },
  { open: 145, high: 147, low: 145, close: 146 },
  { open: 146, high: 146, low: 139, close: 140 },
  { open: 140, high: 142, low: 138, close: 139 },
  { open: 139, high: 140, low: 134, close: 136 },
  { open: 136, high: 138, low: 132, close: 134 },
  { open: 134, high: 135, low: 127, close: 129 },
];

const SIDE_CANDLES: Candle[] = [
  { open: 126, high: 129, low: 124, close: 128 },
  { open: 128, high: 130, low: 126, close: 129 },
  { open: 129, high: 131, low: 128, close: 130 },
  { open: 130, high: 132, low: 129, close: 130 },
  { open: 130, high: 132, low: 128, close: 129 },
  { open: 129, high: 130, low: 127, close: 128 },
  { open: 128, high: 129, low: 126, close: 127 },
  { open: 127, high: 129, low: 126, close: 128 },
  { open: 128, high: 130, low: 127, close: 129 },
  { open: 129, high: 131, low: 128, close: 130 },
  { open: 130, high: 132, low: 129, close: 131 },
  { open: 131, high: 132, low: 129, close: 130 },
  { open: 130, high: 131, low: 128, close: 129 },
  { open: 129, high: 130, low: 127, close: 128 },
  { open: 128, high: 130, low: 126, close: 129 },
  { open: 129, high: 131, low: 128, close: 130 },
  { open: 130, high: 132, low: 129, close: 131 },
  { open: 131, high: 132, low: 129, close: 130 },
  { open: 130, high: 131, low: 128, close: 129 },
  { open: 129, high: 131, low: 128, close: 130 },
];

const scenes: Scene[] = [
  {
    id: 'bull',
    label: 'Trend rialzista',
    shortLabel: 'Rialzista',
    description:
      'Consolidamento iniziale, rottura decisiva della resistenza, retest del livello come nuovo supporto e continuazione rialzista con HH/HL.',
    summary:
      'Struttura formativa con consolidamento, breakout, retest e continuazione rialzista.',
    candles: BULL_CANDLES,
    gridColor: '#0a2414',
    accent: '#00ff6a',
    accent2: '#7dffb4',
    annotations: [
      {
        kind: 'resistance',
        label: 'RESISTENZA',
        y1: 108.5,
        y2: 110.5,
        x1: 0,
        x2: 6,
        align: 'start',
      },
      {
        kind: 'breakout',
        label: 'BREAKOUT',
        x: 10,
        y: 120,
        dir: 'up',
        align: 'center',
      },
      {
        kind: 'retest',
        label: 'RETEST',
        x: 13,
        y: 111,
        dir: 'up',
        align: 'center',
      },
      {
        kind: 'continuation',
        label: 'CONTINUAZIONE',
        x: 17,
        y: 143,
        dir: 'up',
        align: 'end',
      },
      {
        kind: 'zone',
        label: 'NUOVO SUPPORTO',
        y1: 108.5,
        y2: 110.5,
        x1: 8,
        x2: 14,
        align: 'start',
      },
    ],
  },
  {
    id: 'bear',
    label: 'Trend ribassista',
    shortLabel: 'Ribassista',
    description:
      'Distribuzione sopra il supporto, rottura ribassista, rimbalzo verso il livello rotto, rifiuto come nuova resistenza e continuazione ribassista LH/LL.',
    summary:
      'Struttura formativa con distribuzione, breakdown, retest e continuazione ribassista.',
    candles: BEAR_CANDLES,
    gridColor: '#261317',
    accent: '#ff6b85',
    accent2: '#ffa0b3',
    annotations: [
      {
        kind: 'support',
        label: 'SUPPORTO',
        y1: 144.5,
        y2: 146.5,
        x1: 0,
        x2: 9,
        align: 'start',
      },
      {
        kind: 'breakout',
        label: 'BREAKDOWN',
        x: 10,
        y: 140,
        dir: 'down',
        align: 'center',
      },
      {
        kind: 'retest',
        label: 'RETEST',
        x: 14,
        y: 147,
        dir: 'down',
        align: 'center',
      },
      {
        kind: 'continuation',
        label: 'CONTINUAZIONE',
        x: 17,
        y: 136,
        dir: 'down',
        align: 'end',
      },
      {
        kind: 'zone',
        label: 'NUOVA RESISTENZA',
        y1: 144.5,
        y2: 146.5,
        x1: 12,
        x2: 15,
        align: 'end',
      },
    ],
  },
  {
    id: 'side',
    label: 'Lateralizzazione',
    shortLabel: 'Laterale',
    description:
      'Range compreso tra supporto e resistenza ben definiti. Scenario formativo per riconoscere assenza di direzione, qualità del break e false rotture.',
    summary:
      'Range tra supporto e resistenza: il prezzo oscilla senza impronta direzionale chiara.',
    candles: SIDE_CANDLES,
    gridColor: '#182319',
    accent: '#00ff6a',
    accent2: '#c4f3d2',
    annotations: [
      {
        kind: 'resistance',
        label: 'RESISTENZA',
        y1: 131.5,
        y2: 132.5,
        x1: 0,
        x2: 19,
        align: 'end',
      },
      {
        kind: 'support',
        label: 'SUPPORTO',
        y1: 126.2,
        y2: 127.2,
        x1: 0,
        x2: 19,
        align: 'end',
      },
    ],
  },
];

function rangeOf(candles: Candle[], padPct = 0.14): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (const c of candles) {
    if (c.low < min) min = c.low;
    if (c.high > max) max = c.high;
  }
  const pad = (max - min) * padPct || 1;
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

  const pauseFor = useCallback((ms = 9000) => {
    setPaused(true);
    window.setTimeout(() => setPaused(false), ms);
  }, []);

  const current = scenes[idx];
  const [yMin, yMax] = rangeOf(current.candles, 0.1);
  const plotW = WIDTH - PAD_L - PAD_R;
  const plotH = HEIGHT - PAD_T - PAD_B;
  const total = current.candles.length;
  const candleW = plotW / total;
  const bodyW = Math.max(3, candleW * 0.62);

  const yFor = (v: number) => PAD_T + (1 - (v - yMin) / (yMax - yMin)) * plotH;
  const xFor = (i: number) => PAD_L + i * candleW + candleW / 2;

  const yTicks = 5;
  const ticks = Array.from(
    { length: yTicks + 1 },
    (_, i) => yMin + ((yMax - yMin) * i) / yTicks,
  );
  const gradId = `${rootId}-grad-${current.id}`;

  return (
    <GlassCard className="overflow-hidden p-3 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/50 bg-av-green/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-av-green sm:text-xs">
            Visualizzazione scenari di mercato
          </p>
          <h3 className="mt-4 font-display text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            Tre scenari per allenare l&apos;occhio sul prezzo
          </h3>
          <p
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg-2/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] sm:text-xs"
            style={{ color: current.accent }}
          >
            Scenario attuale · {current.label}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-av-muted sm:text-base">
            {current.description}
          </p>
        </div>
      </div>

      <div
        className="mt-5 max-sm:mt-3 grid w-full grid-cols-3 gap-1 max-sm:gap-1 sm:gap-2 md:hidden"
        role="tablist"
        aria-label="Scenari di mercato - mobile"
      >
        {scenes.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            id={`${tabId(i)}-m`}
            aria-selected={i === idx}
            aria-controls={panelId(i)}
            onClick={() => {
              go(i);
              pauseFor();
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className={`min-h-[44px] w-full rounded-xl border px-2 py-2 text-center text-xs font-semibold leading-tight transition-all sm:text-sm [box-sizing:border-box] ${
              i === idx
                ? 'border-av-green-deep bg-av-green/10 text-av-green shadow-glow-green-sm'
                : 'border-av-line bg-av-bg-2/50 text-av-muted hover:text-white hover:border-av-green-deep/60'
            }`}
            style={{ minWidth: 0, maxWidth: '100%' }}
          >
            <span className="block whitespace-normal break-words">
              {s.shortLabel}
            </span>
          </button>
        ))}
      </div>

      <div
        className="mt-5 hidden flex-wrap items-center gap-2 md:flex"
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
              pauseFor();
            }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className={`min-h-[44px] whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-semibold transition-all ${
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
          className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:text-av-green hover:border-av-green-deep/60"
          aria-label={paused ? 'Riprendi animazione scenari' : 'Metti in pausa animazione scenari'}
        >
          {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </button>
      </div>

      <div
        className="mt-5 max-sm:mt-3"
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
          pauseFor(4500);
        }}
      >
        <div
          role="tabpanel"
          id={panelId(idx)}
          aria-labelledby={tabId(idx)}
          className="relative isolate w-full overflow-hidden rounded-2xl border border-av-line bg-av-bg-2 [box-sizing:border-box] aspect-[16/9] max-md:aspect-[4/3] max-md:min-h-[300px]"
        >
          <div className="absolute inset-0 p-2 max-sm:p-2.5 sm:p-4">
            <svg
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              role="img"
              aria-label={`Grafico a candele giapponesi: ${current.label}`}
              style={{ boxSizing: 'border-box', display: 'block' }}
            >
              <defs>
                <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={current.accent} stopOpacity="0.18" />
                  <stop offset="100%" stopColor={current.accent} stopOpacity="0" />
                </linearGradient>
              </defs>

              <rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#050705" rx={8} />
              <rect
                x={PAD_L}
                y={PAD_T}
                width={plotW}
                height={plotH}
                fill={`url(#${gradId})`}
                opacity={0.95}
              />

              <g opacity={0.7}>
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
                  const x = PAD_L + (plotW / 9) * i;
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

              {current.annotations.map((a, i) => {
                if (a.kind === 'zone' || a.kind === 'resistance' || a.kind === 'support') {
                  const xStart = PAD_L + (a.x1 ?? 0) * candleW;
                  const xEnd =
                    a.x2 != null
                      ? PAD_L + (a.x2 + 0.7) * candleW
                      : WIDTH - PAD_R;
                  const yTop = yFor(a.y2 ?? a.y1 ?? yMin);
                  const yBot = yFor(a.y1 ?? a.y2 ?? yMin);
                  const h = Math.max(2, Math.abs(yBot - yTop));
                  const y = Math.min(yTop, yBot);
                  const isResistance = a.kind === 'resistance';
                  const isSupport = a.kind === 'support';
                  const lineStroke =
                    current.id === 'bear' ? 'rgba(255,107,133,0.6)' : 'rgba(0,255,106,0.6)';
                  const fillColor =
                    current.id === 'bear' ? 'rgba(255,107,133,0.08)' : 'rgba(0,255,106,0.08)';
                  const labelColor =
                    current.id === 'bear' ? '#ffa0b3' : current.accent2;
                  const textX = a.align === 'end' ? xEnd - 8 : a.align === 'center' ? (xStart + xEnd) / 2 : xStart + 8;
                  return (
                    <g key={`a-${i}`}>
                      <rect
                        x={xStart}
                        y={y}
                        width={Math.max(1, xEnd - xStart)}
                        height={h}
                        fill={fillColor}
                        stroke={lineStroke}
                        strokeDasharray="6 4"
                        strokeWidth={1}
                        rx={2}
                      />
                      {isResistance || isSupport ? (
                        <>
                          <line
                            x1={xStart}
                            x2={xEnd}
                            y1={isResistance ? y + 1 : y + h - 1}
                            y2={isResistance ? y + 1 : y + h - 1}
                            stroke={lineStroke}
                            strokeWidth={1.6}
                            opacity={0.85}
                          />
                        </>
                      ) : null}
                      {a.label ? (
                        <g>
                          <rect
                            x={Math.max(PAD_L + 2, textX - 4)}
                            y={Math.max(PAD_T + 2, y - 2)}
                            width={Math.min(
                              plotW - 4,
                              (a.label.length * 6.4) + 10,
                            )}
                            height={18}
                            fill="#000"
                            fillOpacity={0.62}
                            rx={4}
                          />
                          <text
                            x={Math.max(PAD_L + 8, textX + 1)}
                            y={Math.max(PAD_T + 15, y + 11)}
                            fontSize="9.5"
                            fontFamily="ui-monospace, Menlo, monospace"
                            letterSpacing="1.1"
                            fill={labelColor}
                          >
                            {a.label}
                          </text>
                        </g>
                      ) : null}
                    </g>
                  );
                }
                if (a.kind === 'breakout' || a.kind === 'retest' || a.kind === 'continuation') {
                  const cx = xFor(a.x ?? Math.floor(total / 2));
                  const cy = yFor(a.y ?? ((yMin + yMax) / 2));
                  const up = a.dir !== 'down';
                  const strokeColor =
                    a.kind === 'breakout' && current.id === 'bear'
                      ? '#ffa0b3'
                      : a.kind === 'continuation' && current.id === 'bear'
                      ? '#ffa0b3'
                      : a.kind === 'retest' && current.id === 'bear'
                      ? '#ffa0b3'
                      : current.accent2;
                  const boxW = a.label.length * 6.6 + 14;
                  const textY = up ? cy - 26 : cy + 22;
                  const arrowStart = up ? cy - 22 : cy + 18;
                  const arrowEnd = up ? cy - 8 : cy + 4;
                  const boxX = cx - boxW / 2;
                  const boxY = Math.min(HEIGHT - PAD_B - 22, Math.max(PAD_T + 2, textY - 12));
                  return (
                    <g key={`a-${i}`}>
                      <rect
                        x={boxX}
                        y={boxY}
                        width={boxW}
                        height={20}
                        rx={10}
                        fill="#000"
                        fillOpacity={0.75}
                        stroke={strokeColor}
                        strokeOpacity={0.55}
                      />
                      <text
                        x={cx}
                        y={boxY + 13.5}
                        fontSize="9.5"
                        fontFamily="ui-monospace, Menlo, monospace"
                        letterSpacing="1.1"
                        fill={strokeColor}
                        textAnchor="middle"
                      >
                        {a.label}
                      </text>
                      <line
                        x1={cx}
                        x2={cx}
                        y1={arrowStart}
                        y2={arrowEnd}
                        stroke={strokeColor}
                        strokeWidth={1.6}
                        strokeDasharray="4 3"
                      />
                      <g transform={`translate(${cx}, ${arrowEnd}) ${up ? '' : 'scale(1,-1)'}`}>
                        <path
                          d={up ? `M 0 0 L -5 -7 L 5 -7 Z` : `M 0 0 L -5 7 L 5 7 Z`}
                          fill={strokeColor}
                        />
                      </g>
                    </g>
                  );
                }
                return null;
              })}

              {current.candles.map((c, i) => {
                const x = xFor(i);
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
                  opacity={0.78}
                >
                  {t.toFixed(0)}
                </text>
              ))}
            </svg>
          </div>
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

      <style>{`@keyframes cvScale { from { transform: scaleY(0); } to { transform: scaleY(1); } }`}</style>
    </GlassCard>
  );
}
