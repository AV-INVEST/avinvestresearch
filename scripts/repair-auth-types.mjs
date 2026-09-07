#!/usr/bin/env node
import { execFileSync, execSync } from 'node:child_process';
import {
  mkdirSync,
  rmSync,
  copyFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PACKS = [
  {
    name: '@auth/core',
    version: '0.41.3',
    subpath: 'node_modules/@auth/core',
    // File that MUST always exist, regardless of whether a .map exists.
    // Some installers (npm on Windows with local cache miss) only emit the map,
    // but not the corresponding .d.ts, so these are our "always check" canaries.
    additionalCheck: ['types.d.ts', 'jwt.d.ts', 'index.d.ts'],
  },
  {
    name: 'next-auth',
    version: '5.0.0-beta.32',
    subpath: 'node_modules/next-auth',
    additionalCheck: [
      'react.d.ts',
      'lib/client.d.ts',
      'lib/actions.d.ts',
      'lib/env.d.ts',
      'lib/index.d.ts',
      'lib/types.d.ts',
      'index.d.ts',
      'jwt.d.ts',
      'middleware.d.ts',
      'next.d.ts',
      'webauthn.d.ts',
    ],
  },
];

function listFiles(targetDir) {
  const out = new Set();
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const s = statSync(full);
      if (s.isDirectory()) walk(full);
      else out.add(relative(targetDir, full).split(sep).join('/'));
    }
  }
  walk(targetDir);
  return out;
}

function collectMissingDts(targetDir, additionalCheck = []) {
  const existing = listFiles(targetDir);
  const missing = new Set();
  for (const f of existing) {
    if (f.endsWith('.d.ts.map')) {
      const corresponding = f.slice(0, -4); // drop '.map' -> leaves .d.ts
      if (!existing.has(corresponding)) missing.add(corresponding);
    }
  }
  for (const rel of additionalCheck) {
    if (!existing.has(rel)) missing.add(rel);
  }
  return [...missing].sort();
}

async function ensureAuthTypeDeclarations() {
  let patchedAny = false;
  const tmpRoot = join(ROOT, '.tmp-auth-types');
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });

  for (const pack of PACKS) {
    const targetDir = join(ROOT, pack.subpath);
    if (!existsSync(targetDir)) {
      console.log(`[repair-auth-types] skipping ${pack.name}: directory missing (package not installed)`);
      continue;
    }
    const missingDts = collectMissingDts(targetDir, pack.additionalCheck);
    if (missingDts.length === 0) {
      console.log(`[repair-auth-types] ${pack.name}: all .d.ts present — no work needed`);
      continue;
    }
    console.log(`[repair-auth-types] ${pack.name}: restoring ${missingDts.length} missing .d.ts declarations:`);
    for (const m of missingDts) console.log(`   - ${m}`);
    const extractDir = join(tmpRoot, `${pack.name.replace('/', '-')}-${pack.version}`);
    mkdirSync(extractDir, { recursive: true });
    const npmArgs = [
      'pack',
      `${pack.name}@${pack.version}`,
      '--pack-destination',
      tmpRoot,
      '--quiet',
    ];
    try {
      execFileSync('npm', npmArgs, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    } catch (err) {
      console.warn(`[repair-auth-types] npm pack ${pack.name} failed, skipping`);
      continue;
    }
    const tgzName = `${pack.name.replace('/', '-')}-${pack.version}.tgz`;
    const tgzPath = join(tmpRoot, tgzName);
    if (!existsSync(tgzPath)) {
      console.warn(`[repair-auth-types] tgz not produced for ${pack.name}, skipping`);
      continue;
    }
    try {
      execSync(`tar -tzf "${tgzPath}" 2>NUL`, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      console.warn(`[repair-auth-types] tar binary not available on PATH, skipping`);
      continue;
    }
    // Extract only the specific missing files to extractDir.
    // tar on Linux + tar.exe on Windows both accept -xzf with explicit paths.
    const tarArgs = [
      '-xzf',
      tgzPath,
      '-C',
      extractDir,
      ...missingDts.map((rel) => `package/${rel}`),
    ];
    try {
      execFileSync('tar', tarArgs, { cwd: ROOT, stdio: ['ignore', 'ignore', 'inherit'] });
    } catch (err) {
      // Fallback: extract the whole tarball and then cherry-pick (safer if tar impl is strict).
      console.warn(`[repair-auth-types] selective extract failed, falling back to full unpack`);
      try {
        execFileSync('tar', ['-xzf', tgzPath, '-C', extractDir], {
          cwd: ROOT,
          stdio: ['ignore', 'ignore', 'inherit'],
        });
      } catch (err2) {
        console.warn(`[repair-auth-types] full unpack also failed, skipping ${pack.name}`);
        continue;
      }
    }
    for (const srcRel of missingDts) {
      const src = join(extractDir, 'package', srcRel);
      const dst = join(targetDir, srcRel);
      mkdirSync(dirname(dst), { recursive: true });
      try {
        copyFileSync(src, dst);
      } catch (e) {
        console.warn(`[repair-auth-types]    WARNING: could not copy ${srcRel}: ${e.message}`);
      }
    }
    patchedAny = true;
    console.log(`[repair-auth-types] ${pack.name}: declarations restored`);
  }

  rmSync(tmpRoot, { recursive: true, force: true });
  if (!patchedAny) {
    console.log('[repair-auth-types] nothing repaired — all .d.ts present');
  }
}

ensureAuthTypeDeclarations().catch((err) => {
  console.error(
    '[repair-auth-types] non-fatal error:',
    err && err.stack ? err.stack : String(err),
  );
});
