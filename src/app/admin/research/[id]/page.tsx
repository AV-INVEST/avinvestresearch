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
  AlertTriangle,
  Save,
  Upload,
  Download,
  Eye,
  Lock,
  Trash2,
  Unlink,
} from 'lucide-react';
import {
  getResearchDocEditor,
  prepareResearchPdfUploadAdmin,
} from '@/lib/admin/research-admin';
import {
  saveResearchDocMetaAction,
  publishResearchDocAction,
  unpublishResearchDocAction,
  confirmResearchPdfUploadAction,
} from '@/app/admin/research/actions';
import { getStorageStatus } from '@/lib/storage';
import { SaveMetaForm, PublishButtons, PdfUploadForm } from './editor-components';

export const dynamic = 'force-dynamic';

export default async function ResearchEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent(`/admin/research/${id}`));
  if (!isAdminSession(session as any)) notFound();

  const state = await getResearchDocEditor(id);
  if (!state.doc) notFound();
  const doc = state.doc;
  const storageStatus = state.storageStatus ?? getStorageStatus();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/research"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna a Research Club
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {doc.title}
          </h1>
          {doc.status === 'PUBLISHED' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-green">
              <CheckCircle2 className="h-3 w-3" /> Pubblicata
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-yellow">
              <CircleDot className="h-3 w-3" /> Bozza
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-av-muted/90">
          slug: {doc.slug} · creato {new Date(doc.createdAt).toLocaleDateString('it-IT')}
        </p>
      </div>

      {!storageStatus.configured ? (
        <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-av-yellow">
                Storage PDF non configurato
              </p>
              <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
                Puoi salvare metadati, bozze e modifiche titolo/descrizione.
                L&apos;upload fisico del file PDF non viene eseguito finché non
                configuri uno storage provider. Nessun fallback pubblico.
              </p>
              {storageStatus.missing.length > 0 ? (
                <code className="mt-2 block rounded-lg border border-av-yellow-deep/20 bg-av-bg-2/80 p-2 text-[11px] text-av-green font-mono whitespace-pre-wrap break-words">
                  {storageStatus.missing.join('\n')}
                </code>
              ) : null}
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-white">
                Metadati documento
              </h2>
              <PublishButtons
                docId={doc.id}
                status={doc.status}
                publishAction={publishResearchDocAction}
                unpublishAction={unpublishResearchDocAction}
              />
            </div>
            <div className="mt-5">
              <SaveMetaForm
                docId={doc.id}
                title={doc.title}
                slug={doc.slug}
                description={doc.description ?? ''}
                publicationDate={doc.publicationDate ? new Date(doc.publicationDate).toISOString().slice(0, 16) : ''}
                saveAction={saveResearchDocMetaAction}
              />
            </div>
          </GlassCard>

          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-white">
              Allegato PDF
            </h2>
            <div className="mt-5">
              <PdfUploadForm
                docId={doc.id}
                storageObjectKey={doc.storageObjectKey}
                pdfFileName={doc.pdfFileName}
                pdfFileSizeBytes={doc.pdfFileSizeBytes}
                storageConfigured={storageStatus.configured}
                prepareUploadFn={async (fd) => prepareResearchPdfUploadAdmin(doc.id, fd)}
                confirmUploadFn={async (fd) => confirmResearchPdfUploadAction(doc.id, fd)}
              />
            </div>
          </GlassCard>
        </div>

        <aside className="space-y-6">
          <GlassCard className="overflow-hidden p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-av-green" />
              <h3 className="text-sm font-semibold text-white">Stato</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start justify-between gap-3">
                <span className="text-av-muted text-xs uppercase tracking-[0.16em] font-semibold">
                  Storage
                </span>
                <span
                  className={`text-xs font-semibold ${
                    storageStatus.configured ? 'text-av-green' : 'text-av-yellow'
                  }`}
                >
                  {storageStatus.configured
                    ? `${storageStatus.provider} attivo`
                    : 'Non configurato'}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-av-muted text-xs uppercase tracking-[0.16em] font-semibold">
                  PDF
                </span>
                <span className={`text-xs font-semibold ${doc.storageObjectKey ? 'text-white' : 'text-av-muted'}`}>
                  {doc.storageObjectKey ? doc.pdfFileName || 'Allegato presente' : 'Nessun allegato'}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-av-muted text-xs uppercase tracking-[0.16em] font-semibold">
                  Ultimo salvataggio
                </span>
                <span className="text-xs text-white/90">
                  {new Date(doc.updatedAt).toLocaleString('it-IT', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span className="text-av-muted text-xs uppercase tracking-[0.16em] font-semibold">
                  Data pubblicazione
                </span>
                <span className="text-xs text-white/90">
                  {doc.publicationDate
                    ? new Date(doc.publicationDate).toLocaleDateString('it-IT')
                    : 'Non impostata'}
                </span>
              </li>
            </ul>
            <div className="mt-5 pt-4 border-t border-av-line space-y-2">
              <button
                type="button"
                disabled
                className="btn-ghost w-full !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
              >
                <Eye className="h-3.5 w-3.5" /> Anteprima pubblica (solo abbonati)
              </button>
              <button
                type="button"
                disabled
                className="btn-ghost w-full !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
              >
                <Download className="h-3.5 w-3.5" /> Test download firmato
              </button>
              <div className="rounded-xl border border-av-line bg-av-bg-2/60 p-3">
                <div className="flex items-start gap-2">
                  <Lock className="h-3.5 w-3.5 flex-none text-av-green mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-av-muted/95">
                    Ricorda: Research Club è un contenuto ad abbonamento separato.
                    La proprietà dei corsi non concede l&apos;accesso ai documenti.
                    Nessun PDF è esposto tramite link pubblico permanente.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </div>
  );
}
