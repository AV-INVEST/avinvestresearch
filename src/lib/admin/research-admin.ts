'use server';

import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/course-admin';
import type { ContentStatus, ResearchDoc, StorageProvider } from '@prisma/client';
import {
  authorizePdfRead,
  preparePdfUpload,
  getStorageStatus,
  deletePdfFile,
  performPdfServerUpload,
  type PrepareUploadResult,
  type AuthorizedReadResult,
} from '@/lib/storage';
import type { Prisma } from '@prisma/client';
import { siteConfig } from '@/config/siteConfig';

const SORT_ASC: Prisma.SortOrder = 'asc';
const SORT_DESC: Prisma.SortOrder = 'desc';

export interface ActionResult {
  ok: boolean;
  error?: string;
  info?: string;
  cleanupWarnings?: string[];
}

export type ResearchDocAdminRow = Pick<
  ResearchDoc,
  | 'id'
  | 'slug'
  | 'title'
  | 'status'
  | 'description'
  | 'publicationDate'
  | 'publishedAt'
  | 'storageProvider'
  | 'storageObjectKey'
  | 'storageBucket'
  | 'pdfFileName'
  | 'pdfFileSizeBytes'
  | 'createdAt'
  | 'updatedAt'
>;

function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);
}

export async function listResearchDocsAdmin(): Promise<ResearchDocAdminRow[]> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return [];
  const rows = await prisma.researchDoc.findMany({
    orderBy: [
      { publishedAt: SORT_DESC },
      { publicationDate: SORT_DESC },
      { createdAt: SORT_DESC },
    ],
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status,
    description: r.description,
    publicationDate: r.publicationDate,
    publishedAt: r.publishedAt,
    storageProvider: r.storageProvider,
    storageObjectKey: r.storageObjectKey,
    storageBucket: r.storageBucket,
    pdfFileName: r.pdfFileName,
    pdfFileSizeBytes: r.pdfFileSizeBytes,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export interface ResearchDocEditorState {
  ok: boolean;
  doc?: ResearchDocAdminRow | null;
  error?: string;
  storageStatus?: ReturnType<typeof getStorageStatus>;
}

export async function getResearchDocEditor(
  id: string,
): Promise<ResearchDocEditorState> {
  await requireAdmin();
  const storageStatus = getStorageStatus();
  if (!isDatabaseConfigured()) {
    return { ok: false, doc: null, error: 'Database non disponibile.', storageStatus };
  }
  const doc = await prisma.researchDoc.findUnique({ where: { id } });
  if (!doc) return { ok: false, doc: null, error: 'Documento non trovato.', storageStatus };
  return {
    ok: true,
    storageStatus,
    doc: {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      status: doc.status,
      description: doc.description,
      publicationDate: doc.publicationDate,
      publishedAt: doc.publishedAt,
      storageProvider: doc.storageProvider,
      storageObjectKey: doc.storageObjectKey,
      storageBucket: doc.storageBucket,
      pdfFileName: doc.pdfFileName,
      pdfFileSizeBytes: doc.pdfFileSizeBytes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    },
  };
}

export async function createResearchDocAdmin(
  formData: FormData,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'Database non disponibile.' };
  }
  const title = (formData.get('title') as string || '').trim().slice(0, 200);
  if (!title) return { ok: false, error: 'Titolo obbligatorio.' };
  const slug = (formData.get('slug') as string || '').trim();
  const finalSlug = slug ? slugify(slug) : slugify(title) || `doc-${Date.now().toString(36)}`;
  const description = (formData.get('description') as string || '').trim().slice(0, 1500);
  try {
    const created = await prisma.researchDoc.create({
      data: {
        slug: finalSlug,
        title,
        description: description.length > 0 ? description : null,
        status: 'DRAFT',
      },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/research');
    return { ok: true, id: created.id };
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return { ok: false, error: 'Slug già in uso. Modifica il titolo o imposta uno slug differente.' };
    }
    return { ok: false, error: 'Errore durante la creazione.' };
  }
}

export async function saveResearchDocMetaAdmin(
  id: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  const title = (formData.get('title') as string || '').trim().slice(0, 200);
  if (!title) return { ok: false, error: 'Titolo obbligatorio.' };
  const slug = (formData.get('slug') as string || '').trim();
  const finalSlug = slug ? slugify(slug) : slugify(title);
  if (!finalSlug) return { ok: false, error: 'Slug non valido.' };
  const description = (formData.get('description') as string || '').trim().slice(0, 1500);
  const publicationDateRaw = (formData.get('publicationDate') as string || '').trim();
  let publicationDate: Date | null = null;
  if (publicationDateRaw) {
    const d = new Date(publicationDateRaw);
    if (!Number.isNaN(d.getTime())) publicationDate = d;
  }
  try {
    await prisma.researchDoc.update({
      where: { id },
      data: {
        title,
        slug: finalSlug,
        description: description.length > 0 ? description : null,
        publicationDate,
      },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true };
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return { ok: false, error: 'Slug già in uso da un altro documento.' };
    }
    return { ok: false, error: 'Errore durante il salvataggio.' };
  }
}

export async function setResearchDocStatusAdmin(
  id: string,
  status: ContentStatus,
): Promise<{ ok: boolean; error?: string; cleanupWarnings?: string[] }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  try {
    const existing = await prisma.researchDoc.findUnique({
      where: { id },
      select: { id: true, status: true, publishedAt: true, storageObjectKey: true },
    });
    if (!existing) return { ok: false, error: 'Documento non trovato.' };
    const data: Prisma.ResearchDocUpdateInput = { status };
    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      if (!existing.publishedAt) data.publishedAt = new Date();
      if (!existing.storageObjectKey) {
        return { ok: false, error: 'Impossibile pubblicare senza un PDF associato. Carica prima il file.' };
      }
    }
    await prisma.researchDoc.update({ where: { id }, data });
    revalidatePath('/admin');
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    let cleanupWarnings: string[] | undefined;
    if (status === 'PUBLISHED') {
      try {
        cleanupWarnings = await enforceMaxPublishedDocs();
      } catch (cleanupErr) {
        const msg = cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr);
        cleanupWarnings = [`Pulizia archivio non riuscita dopo publish: ${msg}`];
      }
    }
    return { ok: true, cleanupWarnings };
  } catch {
    return { ok: false, error: 'Errore durante l\'aggiornamento stato.' };
  }
}

async function enforceMaxPublishedDocs(): Promise<string[]> {
  const warnings: string[] = [];
  if (!isDatabaseConfigured()) return warnings;
  try {
    const limit = siteConfig.researchClub.archiveLimit;
    const count = await prisma.researchDoc.count({ where: { status: 'PUBLISHED' } });
    if (count <= limit) return warnings;
    const excess = count - limit;
    const oldest = await prisma.researchDoc.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { publishedAt: SORT_ASC },
        { publicationDate: SORT_ASC },
        { createdAt: SORT_ASC },
      ],
      take: excess,
      select: { id: true, storageObjectKey: true, title: true },
    });
    for (const doc of oldest) {
      try {
        if (doc.storageObjectKey) {
          const delResult = await deletePdfFile(doc.storageObjectKey);
          if (!delResult.ok) {
            warnings.push(
              `Impossibile rimuovere il file del documento "${doc.title ?? doc.id}" dallo storage: ${delResult.message ?? 'errore sconosciuto'}. Usa l'azione di eliminazione manuale per riprovare.`,
            );
            continue;
          }
        }
        await prisma.researchDoc.delete({ where: { id: doc.id } });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        warnings.push(`Errore durante la pulizia del documento "${doc.title ?? doc.id}": ${msg}`);
      }
    }
    if (warnings.length > 0) {
      console.warn('[research-admin] enforceMaxPublishedDocs ha riscontrato anomalie:', warnings);
    }
    revalidatePath('/admin/research');
    revalidatePath('/area-membri/research-club');
    return warnings;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    warnings.push(`Fallimento generale nella pulizia archivio: ${msg}`);
    return warnings;
  }
}

export async function deleteResearchDocAdmin(
  _prevState: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; info?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  const id = (formData.get('id') as string || '').trim();
  if (!id) return { ok: false, error: 'ID documento mancante.' };
  const existing = await prisma.researchDoc.findUnique({
    where: { id },
    select: { id: true, storageObjectKey: true, title: true, pdfFileName: true },
  });
  if (!existing) return { ok: false, error: 'Documento non trovato.' };
  if (existing.storageObjectKey) {
    const delResult = await deletePdfFile(existing.storageObjectKey);
    if (!delResult.ok) {
      return {
        ok: false,
        error: delResult.message
          ?? 'Non \u00E8 stato possibile eliminare il file PDF dallo storage. Il record database non \u00E8 stato rimosso per evitare file orfani. Riprova pi\u00F9 tardi o controlla le credenziali Vercel Blob.',
        info: `DB record mantenuto: "${existing.title ?? existing.id}" (${existing.pdfFileName ?? 'no filename'}).`,
      };
    }
  }
  try {
    await prisma.researchDoc.delete({ where: { id } });
    revalidatePath('/admin');
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    revalidatePath('/area-membri/research-club');
    return { ok: true, info: 'Documento e PDF eliminati definitivamente.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      error: `PDF rimosso ma cancellazione DB fallita: ${msg}. Potrebbe esistere un record orfano. Riprovare o verificare manualmente.`,
    };
  }
}

export async function uploadResearchPdfAdmin(
  id: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; pdfFileName?: string; pdfFileSizeBytes?: number; info?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return { ok: false, error: 'Nessun file ricevuto. Assicurati di caricare un file PDF valido (<= 25 MB).' };
  }
  if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
    return { ok: false, error: 'Tipo file non valido. Sono accettati solo PDF (MIME: application/pdf).' };
  }
  const maxSize = 25 * 1024 * 1024;
  if (file.size <= 0) return { ok: false, error: 'File vuoto.' };
  if (file.size > maxSize) {
    return { ok: false, error: `File troppo grande (${(file.size / (1024 * 1024)).toFixed(2)} MB). Massimo 25 MB.` };
  }
  const existing = await prisma.researchDoc.findUnique({
    where: { id },
    select: { id: true, storageObjectKey: true },
  });
  if (!existing) return { ok: false, error: 'Documento non trovato.' };

  const prepare = await preparePdfUpload(file.name, file.size);
  if (!prepare.ok || !prepare.storageKey) {
    return { ok: false, error: prepare.message ?? 'Preparazione upload fallita.' };
  }
  const oldKey = existing.storageObjectKey;
  const upload = await performPdfServerUpload(prepare.storageKey, file.stream() as ReadableStream, {
    contentType: 'application/pdf',
    fileName: file.name,
  });
  if (!upload.ok || !upload.pathname) {
    return {
      ok: false,
      error: upload.message ?? 'Errore durante il salvataggio del PDF sullo storage privato.',
    };
  }
  const status = getStorageStatus();
  const providerEnum: StorageProvider =
    status.provider === 'VERCEL_BLOB' ? 'VERCEL_BLOB'
    : status.provider === 'BUNNY_STORAGE' ? 'BUNNY_STORAGE'
    : status.provider === 'S3' ? 'S3' : 'NONE';
  try {
    await prisma.researchDoc.update({
      where: { id },
      data: {
        storageObjectKey: upload.pathname,
        storageProvider: providerEnum,
        pdfFileName: file.name.length > 0 ? file.name.slice(0, 200) : null,
        pdfFileSizeBytes: file.size,
      },
    });
  } catch (dbErr) {
    const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
    try {
      await deletePdfFile(upload.pathname);
    } catch {
      // ignore; warning logged
    }
    return { ok: false, error: `Salvataggio riferimento fallito (${msg}). Nuovo file caricato è stato rimosso per evitare orfani.` };
  }
  let info: string | undefined;
  if (oldKey && oldKey !== upload.pathname) {
    try {
      const r = await deletePdfFile(oldKey);
      if (r.ok) info = 'Precedente PDF sostituito e rimosso dallo storage.';
      else info = `Nuovo PDF caricato. Il vecchio file non è stato rimosso: ${r.message ?? 'errore sconosciuto'}.`;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      info = `Nuovo PDF caricato. Errore rimozione vecchio file: ${msg}.`;
    }
  }
  revalidatePath('/admin/research');
  revalidatePath(`/admin/research/${id}`);
  return {
    ok: true,
    pdfFileName: file.name,
    pdfFileSizeBytes: file.size,
    info,
  };
}

export async function prepareResearchPdfUploadAdmin(
  id: string,
  formData: FormData,
): Promise<PrepareUploadResult> {
  await requireAdmin();
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'INTERNAL' as any, message: 'Database non disponibile.' };
  }
  const fileName = (formData.get('fileName') as string || '').trim();
  const contentLengthRaw = Number(formData.get('contentLength') || 0);
  const contentLength = Number.isFinite(contentLengthRaw) ? contentLengthRaw : 0;
  const exists = await prisma.researchDoc.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { ok: false, error: 'NOT_FOUND' as any, message: 'Documento non trovato.' };
  return preparePdfUpload(fileName, contentLength);
}

export async function confirmResearchPdfUploadAdmin(
  id: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string; storageObjectKey?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  const storageObjectKey = (formData.get('storageObjectKey') as string || '').trim().slice(0, 500);
  const pdfFileName = (formData.get('pdfFileName') as string || '').trim().slice(0, 200);
  const contentLengthRaw = Number(formData.get('contentLength') || 0);
  const pdfFileSizeBytes = Number.isFinite(contentLengthRaw) && contentLengthRaw > 0
    ? Math.floor(contentLengthRaw)
    : null;
  const status = getStorageStatus();
  if (!status.configured) {
    return { ok: false, error: 'Storage privato non configurato. Upload non salvato. Nessun file è stato caricato sul storage permanente.' };
  }
  if (!storageObjectKey) return { ok: false, error: 'Storage key mancante.' };
  try {
    const providerEnum: StorageProvider =
      status.provider === 'VERCEL_BLOB' ? 'VERCEL_BLOB'
      : status.provider === 'BUNNY_STORAGE' ? 'BUNNY_STORAGE'
      : status.provider === 'S3' ? 'S3' : 'NONE';
    await prisma.researchDoc.update({
      where: { id },
      data: {
        storageObjectKey,
        storageProvider: providerEnum,
        pdfFileName: pdfFileName.length > 0 ? pdfFileName : null,
        pdfFileSizeBytes,
      },
    });
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true, storageObjectKey };
  } catch {
    return { ok: false, error: 'Errore durante il salvataggio riferimento file.' };
  }
}

export async function authorizeResearchPdfDownloadAdmin(
  id: string,
): Promise<AuthorizedReadResult> {
  await requireAdmin();
  if (!isDatabaseConfigured()) {
    return { ok: false, error: 'INTERNAL', message: 'Database non disponibile.' };
  }
  const doc = await prisma.researchDoc.findUnique({
    where: { id },
    select: { storageObjectKey: true, title: true, storageProvider: true, storageBucket: true },
  });
  if (!doc) return { ok: false, error: 'NOT_FOUND', message: 'Documento non trovato.' };
  if (!doc.storageObjectKey) {
    return { ok: false, error: 'NOT_FOUND', message: 'Nessun file PDF associato a questo documento.' };
  }
  return authorizePdfRead(doc.storageObjectKey, { ttlSec: 900 });
}
