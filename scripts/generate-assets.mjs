import sharp from 'sharp';
import { writeFileSync, readFileSync, copyFileSync, existsSync, mkdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');

const LOGO_SRC = resolve(ROOT, 'assets', 'av-invest-logo.png');
const ANDREA_SRC = resolve(ROOT, 'assets', 'andrea-founder-source.png');

const ICON_OUT = resolve(ROOT, 'src', 'app', 'icon.png');
const APPLE_ICON_OUT = resolve(ROOT, 'src', 'app', 'apple-icon.png');
const FAVICON_OUT = resolve(ROOT, 'src', 'app', 'favicon.ico');
const OG_OUT = resolve(ROOT, 'src', 'app', 'opengraph-image.png');
const TWITTER_OUT = resolve(ROOT, 'src', 'app', 'twitter-image.png');
const ANDREA_OUT = resolve(ROOT, 'public', 'images', 'andrea-founder.webp');

function ensureDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

async function createIconWithBackground(size, logoMaxSize, outputPath) {
  ensureDir(outputPath);
  const logoBuffer = await sharp(LOGO_SRC)
    .resize(logoMaxSize, logoMaxSize, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 5, g: 7, b: 5, alpha: 1 }
    }
  })
    .composite([{
      input: logoBuffer,
      gravity: 'center'
    }])
    .png({ quality: 95 })
    .toFile(outputPath);
}

async function createFavicon() {
  ensureDir(FAVICON_OUT);
  const size = 48;
  const logoMax = 42;

  const logoBuffer = await sharp(LOGO_SRC)
    .resize(logoMax, logoMax, { fit: 'inside' })
    .toBuffer();

  const png48Buffer = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 5, g: 7, b: 5, alpha: 1 }
    }
  })
    .composite([{
      input: logoBuffer,
      gravity: 'center'
    }])
    .png()
    .toBuffer();

  const pngSize = png48Buffer.length;
  const icoBuffer = Buffer.alloc(6 + 16 + pngSize);

  icoBuffer.writeUInt16LE(0x0000, 0);
  icoBuffer.writeUInt16LE(0x0001, 2);
  icoBuffer.writeUInt16LE(0x0001, 4);

  icoBuffer.writeUInt8(size === 256 ? 0 : size, 6);
  icoBuffer.writeUInt8(size === 256 ? 0 : size, 7);
  icoBuffer.writeUInt8(0, 8);
  icoBuffer.writeUInt8(0, 9);
  icoBuffer.writeUInt16LE(1, 10);
  icoBuffer.writeUInt16LE(32, 12);
  icoBuffer.writeUInt32LE(pngSize, 14);
  icoBuffer.writeUInt32LE(22, 18);

  png48Buffer.copy(icoBuffer, 22);

  writeFileSync(FAVICON_OUT, icoBuffer);
}

async function createOpenGraph() {
  ensureDir(OG_OUT);
  const logoWidth = 500;

  const logoResizedBuffer = await sharp(LOGO_SRC)
    .resize(logoWidth, null, { fit: 'inside' })
    .toBuffer();

  const logoResizedMeta = await sharp(logoResizedBuffer).metadata();
  const logoHeight = logoResizedMeta.height || Math.round(logoWidth * 0.4);

  const logoBase64 = logoResizedBuffer.toString('base64');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="glow" cx="50%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#00ff6a" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#050705" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feFlood flood-color="#00ff6a" flood-opacity="0.55" result="green"/>
      <feComposite in2="blur" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1200" height="630" fill="#070a07"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <image xlink:href="data:image/png;base64,${logoBase64}" x="350" y="100" width="${logoWidth}" height="${logoHeight}"/>
  <text x="600" y="380" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif" font-size="66" font-weight="700" fill="#ffffff" filter="drop-shadow(0 2px 12px rgba(0,255,106,0.25))">AV-INVEST RESEARCH</text>
  <text x="600" y="460" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, Inter, sans-serif" font-size="34" fill="#a9b5ad">Formazione finanziaria, analisi e metodo.</text>
</svg>`;

  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(OG_OUT);
}

async function createAndreaWebp() {
  ensureDir(ANDREA_OUT);
  await sharp(ANDREA_SRC)
    .webp({ quality: 84 })
    .toFile(ANDREA_OUT);
}

function formatKB(bytes) {
  return (bytes / 1024).toFixed(2);
}

async function printFileInfo(filePath, label) {
  const stats = statSync(filePath);
  const meta = await sharp(filePath).metadata();
  console.log(`  [${label}] ${filePath.split(/[\\/]/).pop()}: ${meta.width}x${meta.height}, ${formatKB(stats.size)} KB`);
}

async function main() {
  console.log('== AV-INVEST Asset Generation ==\n');

  console.log('Step 1/6: Generating src/app/icon.png (512x512)...');
  await createIconWithBackground(512, 435, ICON_OUT);

  console.log('Step 2/6: Generating src/app/apple-icon.png (180x180)...');
  await createIconWithBackground(180, 153, APPLE_ICON_OUT);

  console.log('Step 3/6: Generating src/app/favicon.ico (48x48 ICO)...');
  await createFavicon();

  console.log('Step 4/6: Generating src/app/opengraph-image.png (1200x630)...');
  await createOpenGraph();

  console.log('Step 5/6: Copying to src/app/twitter-image.png...');
  copyFileSync(OG_OUT, TWITTER_OUT);

  console.log('Step 6/6: Generating public/images/andrea-founder.webp...');
  await createAndreaWebp();

  console.log('\n== Generated Files Summary ==\n');
  await printFileInfo(ICON_OUT, 'icon.png');
  await printFileInfo(APPLE_ICON_OUT, 'apple-icon.png');

  const favStats = statSync(FAVICON_OUT);
  console.log(`  [favicon.ico] favicon.ico: 48x48, ${formatKB(favStats.size)} KB`);

  await printFileInfo(OG_OUT, 'opengraph-image.png');
  await printFileInfo(TWITTER_OUT, 'twitter-image.png');
  await printFileInfo(ANDREA_OUT, 'andrea-founder.webp');

  console.log('\n✅ Done.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
