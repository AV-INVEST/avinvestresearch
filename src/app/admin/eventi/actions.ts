'use server';

import {
  createLiveEventAdmin,
  saveLiveEventAdmin,
  setLiveEventStatusAdmin,
} from '@/lib/admin/live-event-admin';
import type { LiveEventManageableStatus } from '@/lib/admin/live-event-shared';

export async function actionCreateLiveEvent(formData: FormData) {
  return createLiveEventAdmin(formData);
}

export async function actionSaveLiveEvent(id: string, formData: FormData) {
  return saveLiveEventAdmin(id, formData);
}

export async function actionSetLiveEventStatus(
  id: string,
  status: LiveEventManageableStatus,
) {
  return setLiveEventStatusAdmin(id, status);
}
