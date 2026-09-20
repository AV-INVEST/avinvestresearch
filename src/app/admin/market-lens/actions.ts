'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/course-admin';
import {
  serverUploadMarketLens,
  MARKET_LENS_SIZE_LIMITS,
  MARKET_LENS_STORAGE_KEYS,
  type MarketLensKind,
} from '@/lib/storage';

export type MarketLensUploadResult = {
  ok: boolean;
  error?: string;
  message?: string;
  fileName?: string;
  fileSizeBytes?: number;
  storageKey?: string;
};

const LABEL: Record<MarketLensKind, string> = {
  indicator: 'Indicatore Pine Script',
  guide: 'Guida PDF',
};

export async function uploadMarketLensFile(
  kind: MarketLensKind,
  formData: FormData,
): Promise<MarketLensUploadResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error ?? 'Operazione non autorizzata.' };
  if (!(kind in MARKET_LENS_STORAGE_KEYS)) {
    return { ok: false, error: 'Tipo file non valido.' };
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { ok: false, error: `Nessun file ricevuto per ${LABEL[kind]}.` };
  }
  if (file.size <= 0) return { ok: false, error: 'File vuoto.' };

  const maxBytes = MARKET_LENS_SIZE_LIMITS[kind];
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `File troppo grande (${(file.size / (1024 * 1024)).toFixed(2)} MB). Massimo ${mb} MB per ${LABEL[kind]}.`,
    };
  }

  if (kind === 'guide') {
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      return { ok: false, error: 'Tipo file non valido. Solo PDF accettati per la guida.' };
    }
  } else {
    const fromName = /\.pine$/i.test(file.name.trim());
    const mimeOk =
      !file.type ||
      file.type === 'text/plain' ||
      file.type === 'application/octet-stream' ||
      file.type === 'text/pine' ||
      file.type === 'application/pine';
    if (!mimeOk && !fromName) {
      return {
        ok: false,
        error:
          'Tipo file non valido per l\'indicatore. Usa un file .pine (estensione .pine oppure text/plain).',
      };
    }
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.byteLength <= 0) {
    return { ok: false, error: 'Contenuto file non valido o vuoto.' };
  }

  if (kind === 'indicator') {
    const trimmed = new TextDecoder('utf-8', { fatal: false })
      .decode(bytes)
      .trim();
    if (trimmed.length === 0) {
      return { ok: false, error: 'Il file Pine contiene solo spazi vuoti o caratteri non validi.' };
    }
    if (!trimmed.includes('//@version=')) {
      return {
        ok: false,
        error: 'File Pine non valido: deve contenere l\'intestazione //@version= (es. //@version=5).',
      };
    }
  }

  const upload = await serverUploadMarketLens(kind, bytes, {
    contentType: kind === 'guide' ? file.type || 'application/pdf' : 'text/plain',
    fileName: file.name,
    contentLength: bytes.byteLength,
  });

  if (!upload.ok) {
    return { ok: false, error: upload.message ?? 'Errore durante l\'upload sullo storage privato.' };
  }

  revalidatePath('/admin/market-lens');
  revalidatePath('/area-membri/prodotti');
  return {
    ok: true,
    message: `${LABEL[kind]} caricato con successo (sostituisce qualsiasi versione precedente).`,
    fileName: file.name,
    fileSizeBytes: bytes.byteLength,
    storageKey: upload.pathname,
  };
}
