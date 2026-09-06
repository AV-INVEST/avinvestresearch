import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const outPath = resolve(projectRoot, 'public', 'og-image-v2.png');

await mkdir(dirname(outPath), { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;

const BG = '#050705';
const NEON = '#00FF88';
const WHITE = '#FFFFFF';
const MUTED = '#B8C4BB';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050705"/>
      <stop offset="100%" stop-color="#08120B"/>
    </linearGradient>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <g transform="translate(0, 0)">
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="380" fill="#00FF88" opacity="0.03"/>
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="260" fill="#00FF88" opacity="0.04"/>
  </g>

  <g transform="translate(${WIDTH / 2}, 180)">
    <g transform="translate(0, 0)" filter="url(#neonGlow)">
      <rect x="-160" y="-100" width="320" height="200" rx="28" fill="#0A1A10" stroke="#00FF88" stroke-width="2" opacity="0.6"/>
    </g>
    <g transform="translate(0, 0)">
      <polygon points="-90,55 -50,-55 -10,55" fill="#FFFFFF"/>
      <polygon points="-78,38 -50,-28 -22,38" fill="#050705"/>
      <rect x="-2" y="-55" width="40" height="110" rx="6" fill="#FFFFFF"/>
      <polygon points="38,25 92,-55 110,-38 56,42" fill="#00FF88" filter="url(#softGlow)"/>
    </g>
    <text x="0" y="130" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="8" fill="#00FF88">RESEARCH</text>
  </g>

  <text x="${WIDTH / 2}" y="420" text-anchor="middle" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="72" font-weight="800" letter-spacing="-1" fill="#FFFFFF" filter="url(#softGlow)">AV-INVEST RESEARCH</text>

  <text x="${WIDTH / 2}" y="492" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="500" fill="#00FF88" letter-spacing="0.5">Non seguire il mercato. Impara a leggerlo.</text>

  <text x="${WIDTH / 2}" y="552" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="400" fill="#B8C4BB">Formazione finanziaria, analisi tecnica e gestione del rischio</text>

  <g transform="translate(80, ${HEIGHT - 70})">
    <rect width="14" height="14" rx="3" fill="#00FF88"/>
    <text x="26" y="12" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="600" fill="#B8C4BB" letter-spacing="2">avinvestresearch.com</text>
  </g>
</svg>
`;

const svgBuffer = Buffer.from(svg, 'utf-8');

await sharp(svgBuffer)
  .png({ compressionLevel: 9, quality: 100 })
  .toFile(outPath);

console.log('[og] Generated:', outPath);
