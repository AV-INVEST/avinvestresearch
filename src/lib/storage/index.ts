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

export interface DownloadStreamResult {
  ok: boolean;
  stream?: ReadableStream<Uint8Array>;
  contentType?: string;
  contentLength?: number;
  error?: 'UNCONFIGURED' | 'NOT_FOUND' | 'FORBIDDEN' | 'INTERNAL';
  message?: string;
  fileName?: string | null;
}

export interface ServerUploadResult {
  ok: boolean;
  pathname?: string;
  url?: string;
  error?: 'UNCONFIGURED' | 'INVALID_FILE' | 'INTERNAL';
  message?: string;
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
  return { ok: true, status };
}

export async function getPdfStream(storageObjectKey: string | undefined | null): Promise<DownloadStreamResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message: 'Storage privato non configurato. Download non disponibile.',
    };
  }
  if (!storageObjectKey) {
    return { ok: false, error: 'NOT_FOUND', message: 'Nessun documento collegato a questa pubblicazione.' };
  }
  if (status.provider === 'VERCEL_BLOB') {
    try {
      const { get } = await import('@vercel/blob');
      const res = await get(storageObjectKey, { access: 'private' });
      if (!res) {
        return { ok: false, error: 'NOT_FOUND', message: 'Documento non trovato sullo storage.' };
      }
      if (res.statusCode === 304) {
        return { ok: false, error: 'INTERNAL', message: 'Documento non modificato (304 non supportato in streaming diretto).' };
      }
      const body = res.stream;
      if (!body) return { ok: false, error: 'INTERNAL', message: 'Risposta storage vuota.' };
      return {
        ok: true,
        stream: body as ReadableStream<Uint8Array>,
        contentType: res.blob.contentType || 'application/pdf',
        contentLength: typeof res.blob.size === 'number' ? res.blob.size : undefined,
        fileName: extractFileName(res.blob.contentDisposition),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('not found') || msg.includes('NoSuchKey') || /404/i.test(msg)) {
        return { ok: false, error: 'NOT_FOUND', message: 'Documento non trovato sullo storage.' };
      }
      return { ok: false, error: 'INTERNAL', message: `Errore download storage: ${msg}` };
    }
  }
  return { ok: false, error: 'INTERNAL', message: `Provider ${status.provider} non supportato per lo streaming server.` };
}

export async function performPdfServerUpload(
  storageKey: string,
  data: ReadableStream | Uint8Array | Blob | Buffer,
  opts: { contentType: string; fileName?: string },
): Promise<ServerUploadResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message: 'Storage privato non configurato. Nessun upload verrà eseguito.',
    };
  }
  if (!ALLOWED_PDF_TYPES.includes(opts.contentType)) {
    return { ok: false, error: 'INVALID_FILE', message: 'MIME type non valido. Solo application/pdf accettato.' };
  }
  if (status.provider === 'VERCEL_BLOB') {
    try {
      const { put } = await import('@vercel/blob');
      const putBody = data as Parameters<typeof put>[1];
      const result = await put(storageKey, putBody, {
        access: 'private',
        contentType: opts.contentType,
        addRandomSuffix: false,
      });
      return { ok: true, pathname: result.pathname, url: result.url };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: 'INTERNAL', message: `Errore upload Vercel Blob: ${msg}` };
    }
  }
  return { ok: false, error: 'INTERNAL', message: `Provider ${status.provider} non supportato per upload.` };
}

export async function deletePdfFile(storageObjectKey: string | undefined | null): Promise<{ ok: boolean; error?: string; message?: string }> {
  if (!storageObjectKey) return { ok: true };
  const status = getStorageStatus();
  if (!status.configured) return { ok: false, error: 'UNCONFIGURED', message: 'Storage non configurato.' };
  if (status.provider === 'VERCEL_BLOB') {
    try {
      const { del } = await import('@vercel/blob');
      await del(storageObjectKey);
      return { ok: true };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: 'INTERNAL', message: `Errore cancellazione Vercel Blob: ${msg}` };
    }
  }
  return { ok: false, error: 'INTERNAL', message: `Provider ${status.provider} non supportato per delete.` };
}

function extractFileName(contentDisposition: string | undefined | null): string | null {
  if (!contentDisposition) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
  if (!match || !match[1]) return null;
  try {
    return decodeURIComponent(match[1].replace(/\+/g, ' '));
  } catch {
    return match[1];
  }
}

export const MARKET_LENS_STORAGE_KEYS = Object.freeze({
  indicator: 'products/av-market-lens/AV-Market-Lens.pine',
  guide: 'products/av-market-lens/AV-Market-Lens-Guida.pdf',
} as const);

export const MARKET_LENS_SIZE_LIMITS = Object.freeze({
  indicator: 2 * 1024 * 1024,
  guide: 25 * 1024 * 1024,
} as const);

export type MarketLensKind = keyof typeof MARKET_LENS_STORAGE_KEYS;

export function getMarketLensStorageKey(kind: MarketLensKind): string {
  return MARKET_LENS_STORAGE_KEYS[kind];
}

export async function getMarketLensStream(
  kind: MarketLensKind,
): Promise<DownloadStreamResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message: 'Storage privato non configurato. Download non disponibile.',
    };
  }
  const storageKey = getMarketLensStorageKey(kind);
  if (status.provider === 'VERCEL_BLOB') {
    try {
      const { get } = await import('@vercel/blob');
      const res = await get(storageKey, {
        access: 'private',
        useCache: false,
      });
      if (!res) {
        return { ok: false, error: 'NOT_FOUND', message: 'File Market Lens non trovato sullo storage.' };
      }
      if (res.statusCode === 304) {
        return { ok: false, error: 'INTERNAL', message: 'Risposta 304 non supportata in streaming diretto.' };
      }
      const body = res.stream;
      if (!body) return { ok: false, error: 'INTERNAL', message: 'Risposta storage vuota.' };
      const fallbackContentType = kind === 'indicator' ? 'text/plain' : 'application/pdf';
      return {
        ok: true,
        stream: body as ReadableStream<Uint8Array>,
        contentType: res.blob.contentType || fallbackContentType,
        contentLength: typeof res.blob.size === 'number' ? res.blob.size : undefined,
        fileName: extractFileName(res.blob.contentDisposition),
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('not found') || msg.includes('NoSuchKey') || /404/i.test(msg)) {
        return { ok: false, error: 'NOT_FOUND', message: 'File Market Lens non trovato sullo storage.' };
      }
      return { ok: false, error: 'INTERNAL', message: `Errore download storage: ${msg}` };
    }
  }
  return { ok: false, error: 'INTERNAL', message: `Provider ${status.provider} non supportato per lo streaming server.` };
}

export async function serverUploadMarketLens(
  kind: MarketLensKind,
  data: ReadableStream | Uint8Array | Blob | Buffer,
  opts: { contentType: string; fileName?: string; contentLength?: number },
): Promise<ServerUploadResult> {
  const status = getStorageStatus();
  if (!status.configured) {
    return {
      ok: false,
      error: 'UNCONFIGURED',
      message: 'Storage privato non configurato. Nessun upload verrà eseguito.',
    };
  }
  const maxBytes = MARKET_LENS_SIZE_LIMITS[kind];
  if (typeof opts.contentLength === 'number' && opts.contentLength > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return { ok: false, error: 'INVALID_FILE', message: `File troppo grande. Massimo ${mb} MB.` };
  }
  if (typeof opts.contentLength === 'number' && opts.contentLength <= 0) {
    return { ok: false, error: 'INVALID_FILE', message: 'File vuoto o contenuto non valido.' };
  }
  if (kind === 'guide') {
    const allowed = ['application/pdf'];
    if (opts.contentType && !allowed.includes(opts.contentType)) {
      return { ok: false, error: 'INVALID_FILE', message: 'MIME type non valido. Solo application/pdf accettato per la guida.' };
    }
  } else {
    const allowed = ['text/plain', 'application/octet-stream', 'text/pine', 'application/pine', ''];
    if (opts.contentType && !allowed.includes(opts.contentType)) {
      const { fileName } = opts;
      const fromName = fileName ? /\.pine$/i.test(fileName.trim()) : false;
      if (!fromName) {
        return {
          ok: false,
          error: 'INVALID_FILE',
          message: 'MIME type non valido per l\'indicatore. Usa un file .pine (text/plain o application/octet-stream).',
        };
      }
    }
  }
  if (status.provider === 'VERCEL_BLOB') {
    try {
      const { put, del, head } = await import('@vercel/blob');
      const storageKey = getMarketLensStorageKey(kind);
      const putBody = data as Parameters<typeof put>[1];
      const result = await put(storageKey, putBody, {
        access: 'private',
        contentType: kind === 'indicator' ? 'text/plain' : opts.contentType || 'application/pdf',
        addRandomSuffix: false,
        allowOverwrite: true,
      });

      const savedSize = typeof (result as any).size === 'number' ? (result as any).size : undefined;
      if (typeof savedSize === 'number') {
        if (savedSize <= 0) {
          try { await del(result.pathname); } catch { /* ignore cleanup error */ }
          return { ok: false, error: 'INTERNAL', message: 'Upload fallito: il file salvato risulta vuoto (0 byte). Riprovare.' };
        }
        if (typeof opts.contentLength === 'number' && opts.contentLength > 0) {
          const diff = Math.abs(savedSize - opts.contentLength);
          if (diff > Math.max(1024, Math.floor(opts.contentLength * 0.05))) {
            try { await del(result.pathname); } catch { /* ignore cleanup error */ }
            return { ok: false, error: 'INTERNAL', message: `Upload fallito: dimensione salvata (${savedSize} byte) non corrisponde a quella attesa (${opts.contentLength} byte). Riprovare.` };
          }
        }
      } else {
        try {
          const headInfo = await head(result.pathname);
          const headSize = typeof (headInfo as any).size === 'number' ? (headInfo as any).size : undefined;
          if (typeof headSize === 'number' && headSize <= 0) {
            try { await del(result.pathname); } catch { /* ignore cleanup error */ }
            return { ok: false, error: 'INTERNAL', message: 'Upload fallito: il file salvato risulta vuoto (0 byte). Riprovare.' };
          }
        } catch {
          /* head not available or failed, skip secondary check */
        }
      }

      return { ok: true, pathname: result.pathname, url: result.url };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { ok: false, error: 'INTERNAL', message: `Errore upload Vercel Blob: ${msg}` };
    }
  }
  return { ok: false, error: 'INTERNAL', message: `Provider ${status.provider} non supportato per upload.` };
}
