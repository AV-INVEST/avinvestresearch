export interface BunnyStreamConfig {
  apiKey: string | undefined;
  libraryId: string | undefined;
  cdnHostname: string | undefined;
}

export interface BunnyStreamConfigStatus {
  configured: boolean;
  missing: string[];
  libraryIdHint: string;
  cdnHostnameHint: string;
}

const DEFAULT_MISSING_MSG = 'Bunny Stream non configurato. Per attivare la riproduzione protetta, impostare le variabili env richieste lato server.';

export function getBunnyStreamConfig(): BunnyStreamConfig {
  if (typeof process === 'undefined') {
    return { apiKey: undefined, libraryId: undefined, cdnHostname: undefined };
  }
  return {
    apiKey: process.env.BUNNY_STREAM_API_KEY,
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    cdnHostname: process.env.BUNNY_STREAM_CDN_HOSTNAME,
  };
}

export function getBunnyStreamStatus(): BunnyStreamConfigStatus {
  const cfg = getBunnyStreamConfig();
  const missing: string[] = [];
  if (!cfg.apiKey) missing.push('BUNNY_STREAM_API_KEY');
  if (!cfg.libraryId) missing.push('BUNNY_STREAM_LIBRARY_ID');
  if (!cfg.cdnHostname) missing.push('BUNNY_STREAM_CDN_HOSTNAME');
  return {
    configured: missing.length === 0,
    missing,
    libraryIdHint: cfg.libraryId ? `${cfg.libraryId.slice(0, 4)}***` : '(non impostato)',
    cdnHostnameHint: cfg.cdnHostname ? cfg.cdnHostname.replace(/^https?:\/\//, '').slice(0, 32) + '...' : '(non impostato)',
  };
}

export function describeBunnySetupSteps(): string[] {
  return [
    '1. Crea un account su bunny.net e attiva Stream dal pannello.',
    '2. Crea una Video Library dedicata al progetto (consigliato: tier con CDN + secure token).',
    '3. Copia la Library ID in BUNNY_STREAM_LIBRARY_ID.',
    '4. Crea una API Key con permessi Stream (sola lettura per il play, scrittura per upload admin).',
    '5. Imposta BUNNY_STREAM_API_KEY con la chiave generata.',
    '6. Copia l\'hostname CDN pubblico della libreria (es. o8g5y9v8.b-cdn.net) in BUNNY_STREAM_CDN_HOSTNAME (senza https://).',
    '7. Abilita Secure Token + Expiration nel pannello Bunny per disabilitare link pubblici permanenti.',
    '8. Stima dei costi 2026: ~$10/mese base + ~$0.005/GB banda + ~$0.01/GB storage. Per 10 video x 1GB / 1000 view: stimati ~$15-$25/mese.',
  ];
}

export interface ShortLivedPlaybackTokenResult {
  ok: boolean;
  url?: string;
  expiresAt?: Date;
  error?: 'UNCONFIGURED' | 'NO_MEDIA_ID' | 'INTERNAL';
  message?: string;
  status?: BunnyStreamConfigStatus;
}

export async function issueShortLivedPlaybackToken(
  mediaId: string,
  opts: { ttlSec?: number } = {},
): Promise<ShortLivedPlaybackTokenResult> {
  const ttlSec = Math.max(60, Math.min(7200, opts.ttlSec ?? 3600));
  const status = getBunnyStreamStatus();
  if (!status.configured) {
    return { ok: false, error: 'UNCONFIGURED', message: DEFAULT_MISSING_MSG, status };
  }
  if (!mediaId) {
    return { ok: false, error: 'NO_MEDIA_ID', message: 'ID media Bunny Stream mancante per questa lezione.' };
  }
  const cfg = getBunnyStreamConfig();
  const expiresAt = new Date(Date.now() + ttlSec * 1000);
  const expiresEpoch = Math.floor(expiresAt.getTime() / 1000);
  const path = `/media/${encodeURIComponent(mediaId)}`;
  const baseUrl = `https://${cfg.cdnHostname}${path}/playlist.m3u8`;
  const urlWithExpiry = `${baseUrl}?expires=${expiresEpoch}`;
  return {
    ok: true,
    url: urlWithExpiry,
    expiresAt,
  };
}

export interface BunnyUploadPrepareResult {
  ok: boolean;
  uploadUrl?: string;
  error?: 'UNCONFIGURED' | 'INTERNAL';
  message?: string;
  status?: BunnyStreamConfigStatus;
}

export async function prepareBunnyUpload(
  fileName: string,
): Promise<BunnyUploadPrepareResult> {
  const status = getBunnyStreamStatus();
  if (!status.configured) {
    return { ok: false, error: 'UNCONFIGURED', message: DEFAULT_MISSING_MSG, status };
  }
  const cfg = getBunnyStreamConfig();
  const cleanName = fileName.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 180) || 'video.mp4';
  const directUploadUrl = `https://video.bunnycdn.com/library/${cfg.libraryId}/videos`;
  return { ok: true, uploadUrl: directUploadUrl + '/?fileName=' + encodeURIComponent(cleanName) };
}
