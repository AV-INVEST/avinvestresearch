// Node module customization hook: risolve l'alias "@/..." -> "<root>/src/..." e le
// estensioni TypeScript, cosi i test possono importare i moduli REALI dell'app
// (senza bundler) sfruttando il type-stripping nativo di Node.
//
// Uso: node --import ./scripts/lib/register-ts-alias.mjs scripts/<test>.mjs
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SRC_ROOT = path.join(PROJECT_ROOT, 'src');
const EXTENSIONS = ['.ts', '.mts', '.js', '.mjs', '.cjs', '.json'];

function isFile(candidate) {
  return existsSync(candidate) && statSync(candidate).isFile();
}

function resolveCandidate(basePath) {
  if (isFile(basePath)) return basePath;
  for (const ext of EXTENSIONS) {
    const candidate = `${basePath}${ext}`;
    if (isFile(candidate)) return candidate;
  }
  for (const ext of EXTENSIONS) {
    const candidate = path.join(basePath, `index${ext}`);
    if (isFile(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = resolveCandidate(path.join(SRC_ROOT, specifier.slice(2)));
    if (target) {
      return { url: pathToFileURL(target).href, shortCircuit: true };
    }
  }
  return nextResolve(specifier, context);
}
