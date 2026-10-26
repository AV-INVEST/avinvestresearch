'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/admin/course-admin';
import {
  serverUploadOltreIlGrafico,
  OLTRE_IL_GRAFICO_SIZE_LIMITS,
  OLTRE_IL_GRAFICO_STORAGE_KEYS,
  type OltreIlGraficoKind,
} from '@/lib/storage';

export type OltreIlGraficoUploadResult = {
  ok: boolean;
  error?: string;
  message?: string;
  fileName?: string;
  fileSizeBytes?: number;
  storageKey?: string;
};

const LABEL: Record<OltreIlGraficoKind, string> = {
  pdf: 'PDF Oltre il Grafico',
};

export async function uploadOltreIlGraficoFile(
  kind: OltreIlGraficoKind,
  formData: FormData,
): Promise<OltreIlGraficoUploadResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return { ok: false, error: admin.error ?? 'Operazione non autorizzata.' };
  if (!(kind in OLTRE_IL_GRAFICO_STORAGE_KEYS)) {
    return { ok: false, error: 'Tipo file non valido.' };
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { ok: false, error: `Nessun file ricevuto per ${LABEL[kind]}.` };
  }
  if (file.size <= 0) return { ok: false, error: 'File vuoto.' };

  const maxBytes = OLTRE_IL_GRAFICO_SIZE_LIMITS[kind];
  if (file.size > maxBytes) {
    const mb = (maxBytes / (1024 * 1024)).toFixed(0);
    return {
      ok: false,
      error: `File troppo grande (${(file.size / (1024 * 1024)).toFixed(2)} MB). Massimo ${mb} MB per ${LABEL[kind]}.`,
    };
  }

  if (file.type !== 'application/pdf' && file.type !== 'application/x-pdf' && file.type !== '' && !/\.pdf$/i.test(file.name)) {
    return { ok: false, error: 'Tipo file non valido. Solo PDF accettati per il romanzo.' };
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  if (buffer.byteLength <= 0) {
    return { ok: false, error: 'Contenuto file non valido o vuoto.' };
  }

  const upload = await serverUploadOltreIlGrafico(kind, buffer, {
    contentType: file.type || 'application/pdf',
    fileName: file.name,
    contentLength: buffer.byteLength,
  });

  if (!upload.ok) {
    return { ok: false, error: upload.message ?? 'Errore durante l\'upload sullo storage privato.' };
  }

  revalidatePath('/admin/oltre-il-grafico');
  revalidatePath('/area-membri/prodotti');
  return {
    ok: true,
    message: `${LABEL[kind]} caricato con successo (sostituisce qualsiasi versione precedente).`,
    fileName: file.name,
    fileSizeBytes: buffer.byteLength,
    storageKey: upload.pathname,
  };
}
