'use client';

import { useEffect, useId, useState } from 'react';

interface HeroChartSVGProps {
  className?: string;
}

export default function HeroChartSVG({ className = '' }: HeroChartSVGProps) {
  const strokeId = useId();
  const glowId = useId();
  const areaId = useId();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);
    const handler = () => setReduced(mql.matches);
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const width = 900;
  const height = 380;
  const padding = 40;

  const points = [
    [40, 290],
    [90, 270],
    [140, 285],
    [190, 240],
    [240, 260],
    [290, 220],
    [340, 235],
    [390, 190],
    [440, 215],
    [490, 170],
    [540, 195],
    [590, 145],
    [640, 175],
    [690, 115],
    [740, 150],
    [790, 95],
    [840, 130],
    [880, 80],
  ] as const;

  const pathD = points
    .map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`))
    .join(' ');

  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${
    height - padding
  } Z`;

  const totalLen = 2000;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Grafico finanziario decorativo"
      className={`h-full w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={areaId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#00ff6a" stopOpacity="0.28" />
          <stop offset="60%" stopColor="#00ff6a" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#00ff6a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={strokeId} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#00ff6a" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#00ff6a" stopOpacity="1" />
          <stop offset="100%" stopColor="#7dffb4" stopOpacity="1" />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g opacity="0.45" stroke="#0a2414" strokeWidth="1" fill="none">
        {Array.from({ length: 8 }).map((_, i) => {
          const y = padding + ((height - padding * 2) / 7) * i;
          return <line key={`h${i}`} x1={padding} x2={width - padding} y1={y} y2={y} />;
        })}
        {Array.from({ length: 12 }).map((_, i) => {
          const x = padding + ((width - padding * 2) / 11) * i;
          return <line key={`v${i}`} x1={x} x2={x} y1={padding} y2={height - padding} />;
        })}
      </g>

      <path
        d={areaD}
        fill={`url(#${areaId})`}
        opacity="0.9"
      />

      <path
        d={pathD}
        fill="none"
        stroke={`url(#${strokeId})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        style={
          reduced
            ? undefined
            : {
                strokeDasharray: `${totalLen}`,
                strokeDashoffset: `${totalLen}`,
                animation: 'chartDraw 3.2s ease-out forwards',
              }
        }
      />

      <g
        style={
          reduced
            ? undefined
            : {
                opacity: 0,
                animation: 'fadeIn 0.6s ease-out 2.6s forwards',
              }
        }
      >
        {points.slice(-3).map(([x, y], i) => (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r={i === 2 ? 5 : 3.5}
            fill={i === 2 ? '#00ff6a' : '#7dffb4'}
            style={
              i === 2 && !reduced
                ? {
                    transformOrigin: `${x}px ${y}px`,
                    animation: 'pulseGlow 2.6s ease-in-out 3s infinite',
                  }
                : undefined
            }
          />
        ))}
        <line
          x1={points[points.length - 1][0]}
          x2={padding}
          y1={points[points.length - 1][1]}
          y2={points[points.length - 1][1]}
          stroke="#00ff6a"
          strokeDasharray="4 6"
          strokeOpacity="0.5"
        />
        <g>
          <rect
            x={padding}
            y={points[points.length - 1][1] - 14}
            rx="6"
            ry="6"
            width="78"
            height="22"
            fill="#00ff6a"
            fillOpacity="0.12"
            stroke="#00ff6a"
            strokeOpacity="0.5"
          />
          <text
            x={padding + 10}
            y={points[points.length - 1][1] + 2}
            fontSize="11"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fill="#00ff6a"
            letterSpacing="0.5"
          >
            LIVE · MKT
          </text>
        </g>
      </g>
    </svg>
  );
}
