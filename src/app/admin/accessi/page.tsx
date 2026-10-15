import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin/course-admin';
import { listManualGrantEvents, listManualGrants } from '@/lib/admin/manual-grant-admin';
import { isManualGrantsEnabled } from '@/lib/entitlements-grants';
import {
  COMPLIMENTARY_REASONS,
  EVIDENCE_TYPE_OPTIONS,
  ONE_TIME_PRODUCTS,
} from '@/lib/admin/manual-grant-shared';
import { AccessiManager } from './accessi-manager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Accessi manuali',
  robots: { index: false, follow: false },
};

export default async function AdminAccessiPage() {
  const guard = await requireAdmin();

  if (!guard.ok) {
    return (
      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-6">
        <h1 className="font-display text-xl font-semibold text-white">Accessi manuali</h1>
        <p className="mt-2 text-sm text-av-muted">{guard.error}</p>
      </div>
    );
  }

  const [grantsRes, eventsRes] = await Promise.all([
    listManualGrants(),
    listManualGrantEvents(),
  ]);

  return (
    <AccessiManager
      enabled={isManualGrantsEnabled()}
      grants={grantsRes.grants}
      events={eventsRes.events}
      grantsError={grantsRes.ok ? null : grantsRes.error ?? 'Errore caricamento accessi.'}
      eventsError={eventsRes.ok ? null : eventsRes.error ?? 'Errore caricamento registro.'}
      products={ONE_TIME_PRODUCTS.map((product) => ({ slug: product.slug, title: product.title }))}
      reasons={COMPLIMENTARY_REASONS.map((reason) => ({ value: reason.value, label: reason.label }))}
      evidenceTypes={EVIDENCE_TYPE_OPTIONS.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
    />
  );
}
