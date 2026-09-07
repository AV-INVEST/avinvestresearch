import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  CircleDot,
  CheckCircle2,
  CalendarDays,
  Plus,
  AlertTriangle,
  Eye,
  Upload,
  Lock,
} from 'lucide-react';
import {
  listResearchDocsAdmin,
} from '@/lib/admin/research-admin';
import { CreateDocForm as CreateDocFormClient } from './create-doc-form';
import { AdminResearchDeleteButton } from './delete-button';
import {
  getStorageStatus,
  describeStorageSetupSteps,
  type StorageConfigStatus,
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

function formatDate(d: Date | string | null) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function StorageUnconfiguredBanner({ status }: { status: StorageConfigStatus }) {
  return (
    <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-av-yellow">
            Storage PDF non configurato
          </p>
          <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
            Nessun provider di storage privato rilevato. I metadati dei documenti
            possono essere creati e salvati, ma l&apos;upload fisico del PDF non
            verrà completato. Impostare una delle seguenti opzioni:
          </p>
          {status.missing.length > 0 ? (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-av-yellow/85">
                Variabili mancanti
              </p>
              <code className="mt-1 block rounded-lg border border-av-yellow-deep/20 bg-av-bg-2/80 p-2 text-[11px] text-av-green font-mono whitespace-pre-wrap break-words">
                {status.missing.join('\n')}
              </code>
            </div>
          ) : null}
          <details className="mt-3 rounded-lg border border-av-yellow-deep/20 bg-av-bg-2/60 p-3">
            <summary className="cursor-pointer text-[12px] font-semibold text-av-yellow">
              Mostra istruzioni setup provider
            </summary>
            <div className="mt-2 space-y-1 text-[11px] leading-relaxed text-av-yellow/90 whitespace-pre-line">
              {describeStorageSetupSteps().join('\n')}
            </div>
          </details>
        </div>
      </div>
    </GlassCard>
  );
}

export default async function ResearchAdminPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent('/admin/research'));
  if (!isAdminSession(session as any)) notFound();

  const docs = await listResearchDocsAdmin();
  const storageStatus = getStorageStatus();

  const DraftBadge = () => (
    <span className="inline-flex items-center gap-1 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-yellow">
      <CircleDot className="h-2.5 w-2.5" /> Bozza
    </span>
  );
  const PublishedBadge = () => (
    <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-green">
      <CheckCircle2 className="h-2.5 w-2.5" /> Pubblicata
    </span>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna a dashboard admin
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              Gestione contenuti · Research Club
            </h1>
            <p className="mt-1 text-sm text-av-muted">
              Documenti PDF, bozze, pubblicazioni e riferimenti storage.
            </p>
          </div>
        </div>
      </div>

      {!storageStatus.configured ? <StorageUnconfiguredBanner status={storageStatus} /> : null}

      <GlassCard className="overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-lg">
            <h2 className="font-display text-lg font-semibold text-white">
              Nuovo documento
            </h2>
            <p className="mt-1 text-xs text-av-muted">
              Crea la scheda documento. Puoi modificare titolo, descrizione e
              data pubblicazione in un secondo momento. L&apos;upload del PDF
              richiede storage privato configurato.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <CreateDocFormClient />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden divide-y divide-av-line p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-av-green" />
            <h2 className="font-display text-base font-semibold text-white">
              Documenti ({docs.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-av-muted">
            <span className="inline-flex items-center gap-1">
              <CircleDot className="h-3 w-3 text-av-yellow" /> Bozze
            </span>
            <span className="opacity-50">·</span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-av-green" /> Pubblicate
            </span>
          </div>
        </div>
        {docs.length === 0 ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
                <FileText className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  Nessun documento creato
                </p>
                <p className="mt-1 text-xs text-av-muted">
                  Crea il primo documento Research Club usando il modulo sopra.
                  Finché nessuno storage è attivo, i file non vengono caricati.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-av-line">
            {docs.map((d) => (
              <li key={d.id} className="px-4 py-3.5 sm:px-6 sm:py-4">
                <div className="flex items-stretch justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-white sm:text-base">
                        {d.title}
                      </h3>
                      {d.status === 'PUBLISHED' ? <PublishedBadge /> : <DraftBadge />}
                      {d.storageObjectKey ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/30 bg-av-green/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                          <FileText className="h-2.5 w-2.5" /> PDF
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-av-line bg-av-bg-2/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-muted/90">
                          <Upload className="h-2.5 w-2.5" /> Senza allegato
                        </span>
                      )}
                    </div>
                    {d.description ? (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-av-muted/95">
                        {d.description}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-av-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {d.status === 'PUBLISHED' ? `Pubblicato: ${formatDate(d.publicationDate)}` : `Data: ${formatDate(d.publicationDate)}`}
                      </span>
                      {d.pdfFileName ? (
                        <span className="truncate max-w-xs">
                          {d.pdfFileName}
                        </span>
                      ) : null}
                      <span className="text-av-muted/70">slug: {d.slug}</span>
                    </div>
                  </div>
                  <div className="flex flex-none flex-col items-stretch justify-center gap-2 sm:flex-row sm:items-center">
                    <AdminResearchDeleteButton
                      docId={d.id}
                      docTitle={d.title}
                    />
                    <Link
                      href={`/admin/research/${d.id}`}
                      className="btn-primary !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 shadow-glow-green-sm whitespace-nowrap"
                    >
                      Modifica
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}

