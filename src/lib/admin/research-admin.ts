'use server';

import { revalidatePath } from 'next/cache';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { requireAdmin } from '@/lib/admin/course-admin';
import type { ContentStatus, ResearchDoc, StorageProvider } from '@prisma/client';
import {
  authorizePdfRead,
  preparePdfUpload,
  getStorageStatus,
  type PrepareUploadResult,
  type AuthorizedReadResult,
} from '@/lib/storage';
import type { Prisma } from '@prisma/client';

const SORT_ASC: Prisma.SortOrder = 'asc';
const SORT_DESC: Prisma.SortOrder = 'desc';

export type ResearchDocAdminRow = Pick<
  ResearchDoc,
  | 'id'
  | 'slug'
  | 'title'
  | 'status'
  | 'description'
  | 'publicationDate'
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
): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!isDatabaseConfigured()) return { ok: false, error: 'Database non disponibile.' };
  try {
    await prisma.researchDoc.update({
      where: { id },
      data: {
        status,
      },
    });
    revalidatePath('/admin');
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Errore durante l\'aggiornamento stato.' };
  }
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
