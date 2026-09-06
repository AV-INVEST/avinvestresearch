import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const logoPath = resolve(projectRoot, 'assets', 'av-invest-logo.png');
const outPath = resolve(projectRoot, 'public', 'og-image-v2.png');

await mkdir(dirname(outPath), { recursive: true });

const WIDTH = 1200;
const HEIGHT = 630;
const NEON = '#00FF88';
const WHITE = '#FFFFFF';
const MUTED = '#B8C4BB';

const logoPng = await readFile(logoPath);
const logoDataUri = 'data:image/png;base64,' + logoPng.toString('base64');

const LOGO_W = 340;
const LOGO_H = 340;
const LOGO_X = (WIDTH - LOGO_W) / 2;
const LOGO_Y = 40;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050705"/>
      <stop offset="100%" stop-color="#08120B"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#00FF88" stop-opacity="0.07"/>
      <stop offset="100%" stop-color="#00FF88" stop-opacity="0"/>
    </radialGradient>
    <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <image xlink:href="${logoDataUri}" x="${LOGO_X}" y="${LOGO_Y}" width="${LOGO_W}" height="${LOGO_H}" preserveAspectRatio="xMidYMid meet"/>

  <text x="${WIDTH / 2}" y="458" text-anchor="middle" font-family="'Space Grotesk', Inter, Arial, sans-serif" font-size="58" font-weight="800" letter-spacing="-0.5" fill="#FFFFFF" filter="url(#softGlow)">AV-INVEST RESEARCH</text>

  <text x="${WIDTH / 2}" y="518" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="26" font-weight="500" fill="${NEON}" letter-spacing="0.3">Non seguire il mercato. Impara a leggerlo.</text>

  <text x="${WIDTH / 2}" y="568" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="400" fill="${MUTED}">Formazione finanziaria, analisi tecnica e gestione del rischio</text>

  <g transform="translate(80, ${HEIGHT - 54})">
    <rect width="12" height="12" rx="3" fill="${NEON}"/>
    <text x="24" y="11" font-family="Inter, Arial, sans-serif" font-size="15" font-weight="600" fill="${MUTED}" letter-spacing="2">avinvestresearch.com</text>
  </g>
</svg>
`;

const svgBuffer = Buffer.from(svg, 'utf-8');

await sharp(svgBuffer)
  .png({ compressionLevel: 9, quality: 100 })
  .toFile(outPath);

console.log('[og] Generated:', outPath);
