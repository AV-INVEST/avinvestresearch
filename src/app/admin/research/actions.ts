'use server';

import { revalidatePath } from 'next/cache';
import {
  createResearchDocAdmin,
  saveResearchDocMetaAdmin,
  setResearchDocStatusAdmin,
  confirmResearchPdfUploadAdmin,
} from '@/lib/admin/research-admin';

export async function createResearchDocAction(_: unknown, formData: FormData) {
  const res = await createResearchDocAdmin(formData);
  if (res.ok) {
    revalidatePath('/admin/research');
    revalidatePath('/admin');
    return { ok: true, id: res.id };
  }
  return { ok: false, error: res.error };
}

export async function saveResearchDocMetaAction(id: string, formData: FormData) {
  const res = await saveResearchDocMetaAdmin(id, formData);
  if (res.ok) {
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true };
  }
  return { ok: false, error: res.error };
}

export async function publishResearchDocAction(id: string) {
  const res = await setResearchDocStatusAdmin(id, 'PUBLISHED');
  if (res.ok) {
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true };
  }
  return { ok: false, error: res.error };
}

export async function unpublishResearchDocAction(id: string) {
  const res = await setResearchDocStatusAdmin(id, 'DRAFT');
  if (res.ok) {
    revalidatePath('/admin/research');
    revalidatePath(`/admin/research/${id}`);
    return { ok: true };
  }
  return { ok: false, error: res.error };
}

export async function confirmResearchPdfUploadAction(id: string, formData: FormData) {
  return confirmResearchPdfUploadAdmin(id, formData);
}
