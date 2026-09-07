export type StorageProvider = 'VERCEL_BLOB' | 'BUNNY_STORAGE' | 'S3';

export interface StorageConfigStatus {
  configured: boolean;
  provider: StorageProvider | null;
  missing: string[];
  providerHints: Record<StorageProvider, string>;
}

export interface PrepareUploadResult {
  ok: boolean;
  uploadMethod?: 'PUT_URL' | 'DIRECT_PUT';
  uploadUrl?: string;
  storageKey?: string;
  provider?: StorageProvider;
  error?: 'UNCONFIGURED' | 'INVALID_FILE' | 'INTERNAL';
  message?: string;
  status?: StorageConfigStatus;
  maxSizeBytes?: number;
  allowedTypes?: string[];
}

export interface AuthorizedReadResult {
  ok: boolean;
  signedUrl?: string;
  error?: 'UNCONFIGURED' | 'NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL';
  message?: string;
  status?: StorageConfigStatus;
}

const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_PDF_BYTES = 25 * 1024 * 1024;

function readEnv(name: string): string | undefined {
  if (typeof process === 'undefined') return undefined;
  return process.env[name];
}

function detectProvider(): { provider: StorageProvider | null; missing: string[] } {
  const vercel = readEnv('BLOB_READ_WRITE_TOKEN');
  if (vercel) return { provider: 'VERCEL_BLOB', missing: [] };

  const bunnyRegion = readEnv('BUNNY_STORAGE_REGION');
  const bunnyKey = readEnv('BUNNY_STORAGE_API_KEY');
  const bunnyName = readEnv('BUNNY_STORAGE_ZONE_NAME');
  const bunnyCdn = readEnv('BUNNY_STORAGE_CDN_HOSTNAME');
  if (bunnyRegion && bunnyKey && bunnyName && bunnyCdn) {
    return { provider: 'BUNNY_STORAGE', missing: [] };
  }
  const bunnyMissing: string[] = [];
  if (!bunnyRegion) bunnyMissing.push('BUNNY_STORAGE_REGION');
  if (!bunnyKey) bunnyMissing.push('BUNNY_STORAGE_API_KEY');
  if (!bunnyName) bunnyMissing.push('BUNNY_STORAGE_ZONE_NAME');
  if (!bunnyCdn) bunnyMissing.push('BUNNY_STORAGE_CDN_HOSTNAME');
  if (bunnyMissing.length < 4) {
    return { provider: 'BUNNY_STORAGE', missing: bunnyMissing };
  }

  const s3Access = readEnv('S3_ACCESS_KEY_ID');
  const s3Secret = readEnv('S3_SECRET_ACCESS_KEY');
  const s3Bucket = readEnv('S3_BUCKET');
  const s3Region = readEnv('S3_REGION');
  if (s3Access && s3Secret && s3Bucket && s3Region) {
    return { provider: 'S3', missing: [] };
  }
  return { provider: null, missing: [] };
}

export function getStorageStatus(): StorageConfigStatus {
  const { provider, missing } = detectProvider();
  return {
    configured: !!provider && missing.length === 0,
    provider,
    missing,
    providerHints: {
      VERCEL_BLOB: readEnv('BLOB_READ_WRITE_TOKEN')
        ? `${readEnv('BLOB_READ_WRITE_TOKEN')!.slice(0, 6)}***`
        : '(non impostato)',
      BUNNY_STORAGE: readEnv('BUNNY_STORAGE_ZONE_NAME') || '(non impostato)',
      S3: readEnv('S3_BUCKET') || '(non impostato)',
    },
  };
}

export function describeStorageSetupSteps(): string[] {
  return [
    'Provider A - Vercel Blob (consigliato per rapidità, costo variabile):',
    '  - Abilita Vercel Blob nel progetto (dashboard Vercel → Storage → Blob).',
    '  - Copia BLOB_READ_WRITE_TOKEN dal pannello. Costo 2026: ~$0.015/GB storage + ~$0.08/GB uscita.',
    '',
    'Provider B - Bunny Storage (consigliato per volumi alti):',
    '  - Crea una Storage Zone in bunny.net, regione EU consigliata.',
    '  - Imposta: BUNNY_STORAGE_REGION (es. de), BUNNY_STORAGE_API_KEY, BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_CDN_HOSTNAME.',
    '  - Abilita Pull Zone + Secure Token per evitare link pubblici permanenti.',
    '',
    'Provider C - S3 compatibile (AWS / Cloudflare R2 / Backblaze):',
    '  - Imposta S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET, S3_REGION.',
    '  - Per R2 disabilita list public e configura Cloudflare Worker signed URL.',
    '',
    'Regole: link firmati max 15 minuti, mime=application/pdf, max 25MB per file.',
  ];
}

export async function preparePdfUpload(fileName: string, contentLength: number): Promise<PrepareUploadResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message:
        'Storage privato non configurato. Nessun upload verrà eseguito. Segui i passaggi indicati per attivare uno dei provider supportati.',
      status,
      maxSizeBytes: MAX_PDF_BYTES,
      allowedTypes: ALLOWED_PDF_TYPES,
    };
  }
  if (!fileName || !/\.pdf$/i.test(fileName.trim())) {
    return { ok: false, error: 'INVALID_FILE', message: 'Solo file .pdf sono accettati per i documenti Research Club.' };
  }
  if (contentLength > MAX_PDF_BYTES) {
    return { ok: false, error: 'INVALID_FILE', message: 'File troppo grande. Massimo 25 MB.' };
  }
  if (contentLength <= 0) {
    return { ok: false, error: 'INVALID_FILE', message: 'File vuoto.' };
  }
  const safeName = fileName.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 180) || 'doc.pdf';
  const storageKey = `research/${Date.now()}_${safeName}`;
  return {
    ok: true,
    uploadMethod: 'DIRECT_PUT',
    storageKey,
    provider: status.provider!,
    maxSizeBytes: MAX_PDF_BYTES,
    allowedTypes: ALLOWED_PDF_TYPES,
  };
}

export async function authorizePdfRead(
  storageKey: string | undefined,
  _opts: { ttlSec?: number } = {},
): Promise<AuthorizedReadResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message: 'Storage privato non configurato. Download non disponibile.',
      status,
    };
  }
  if (!storageKey) {
    return { ok: false, error: 'NOT_FOUND', message: 'Nessun documento collegato a questa pubblicazione.' };
  }
  return {
    ok: false,
    error: 'INTERNAL',
    message: `Provider ${status.provider} rilevato ma integrazione signed URL non attivata in questa build. Il file non viene esposto tramite fallback pubblico.`,
    status,
  };
}
