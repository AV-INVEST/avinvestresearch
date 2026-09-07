'use client';

import { useState, useTransition, useRef } from 'react';
import { useActionState } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Upload,
  FileText,
  Loader2,
  Unlink,
  Trash2,
  XCircle,
} from 'lucide-react';

type PublishAction = (id: string) => Promise<{ ok: boolean; error?: string; cleanupWarnings?: string[] }>;
type SaveMetaAction = (id: string, formData: FormData) => Promise<{ ok: boolean; error?: string }>;
type PrepareUploadFn = (formData: FormData) => Promise<any>;
type ConfirmUploadFn = (formData: FormData) => Promise<any>;
type DeleteAction = (_prevState: unknown, fd: FormData) => Promise<{ ok: boolean; error?: string; info?: string }>;
type UploadPdfAction = (
  id: string,
  fd: FormData,
) => Promise<{ ok: boolean; error?: string; pdfFileName?: string; pdfFileSizeBytes?: number; info?: string }>;

function FieldMessage({ ok, error, success }: { ok?: boolean; error?: string | null; success?: string }) {
  if (error) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
        <AlertCircle className="h-3.5 w-3.5" /> {error}
      </p>
    );
  }
  if (ok && success) {
    return (
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-av-green">
        <CheckCircle2 className="h-3.5 w-3.5" /> {success}
      </p>
    );
  }
  return null;
}

export function PublishButtons({
  docId,
  status,
  publishAction,
  unpublishAction,
}: {
  docId: string;
  status: string;
  publishAction: PublishAction;
  unpublishAction: PublishAction;
}) {
  const [isPendingPub, startPub] = useTransition();
  const [isPendingUnpub, startUnpub] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string; warnings?: string[] } | null>(null);

  const published = status === 'PUBLISHED';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {published ? (
          <button
            type="button"
            disabled={isPendingPub || isPendingUnpub}
            onClick={() =>
              startUnpub(async () => {
                setMsg(null);
                const r = await unpublishAction(docId);
                setMsg({ ok: r.ok, text: r.ok ? 'Stato aggiornato: bozza.' : r.error || 'Errore.' });
              })
            }
            className="btn-ghost !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 border-av-yellow-deep/30 text-av-yellow hover:bg-av-yellow/10"
          >
            {isPendingUnpub ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CircleDot className="h-3.5 w-3.5" />}
            Porta in bozza
          </button>
        ) : (
          <button
            type="button"
            disabled={isPendingPub || isPendingUnpub}
            onClick={() =>
              startPub(async () => {
                setMsg(null);
                const r = await publishAction(docId);
                setMsg({
                  ok: r.ok,
                  text: r.ok ? 'Stato aggiornato: pubblicata.' : r.error || 'Errore.',
                  warnings: r.cleanupWarnings && r.cleanupWarnings.length > 0 ? r.cleanupWarnings : undefined,
                });
                if (r.ok) setTimeout(() => location.reload(), 1400);
              })
            }
            className="btn-primary !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 shadow-glow-green-sm"
          >
            {isPendingPub ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Pubblica
          </button>
        )}
        {msg ? (
          <span className={`text-[11px] font-semibold ${msg.ok ? 'text-av-green' : 'text-red-400'}`}>
            {msg.text}
          </span>
        ) : null}
      </div>
      {msg?.warnings && msg.warnings.length > 0 ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.05] p-3 space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
            <AlertCircle className="h-3.5 w-3.5" />
            Pulizia archivio (max 12 pubblicate): sono emersi avvisi non bloccanti
          </p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] leading-relaxed text-amber-200/95">
            {msg.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SaveMetaForm({
  docId,
  title,
  slug,
  description,
  publicationDate,
  saveAction,
}: {
  docId: string;
  title: string;
  slug: string;
  description: string;
  publicationDate: string;
  saveAction: SaveMetaAction;
}) {
  const [state, formAction, isPending] = useActionState(
    async (_: unknown, fd: FormData) => {
      return saveAction(docId, fd);
    },
    null,
  );

  return (
    <form action={formAction as any} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
            Titolo documento *
          </label>
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={title}
            className="w-full rounded-xl border border-av-line bg-av-bg-2/60 px-3.5 py-2.5 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none focus:ring-2 focus:ring-av-green/20"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
            Slug
          </label>
          <input
            name="slug"
            maxLength={120}
            defaultValue={slug}
            className="w-full rounded-xl border border-av-line bg-av-bg-2/60 px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none focus:ring-2 focus:ring-av-green/20"
          />
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
          Data pubblicazione
        </label>
        <input
          name="publicationDate"
          type="datetime-local"
          defaultValue={publicationDate}
          className="w-full sm:max-w-xs rounded-xl border border-av-line bg-av-bg-2/60 px-3.5 py-2.5 text-sm text-white focus:border-av-green-deep/60 focus:outline-none focus:ring-2 focus:ring-av-green/20"
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
          Descrizione e sommario
        </label>
        <textarea
          name="description"
          rows={5}
          maxLength={1500}
          defaultValue={description}
          placeholder="Sommario del documento, punti chiave, contesto di mercato..."
          className="w-full rounded-xl border border-av-line bg-av-bg-2/60 px-3.5 py-2.5 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none focus:ring-2 focus:ring-av-green/20 resize-y"
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salva modifiche
        </button>
        <FieldMessage ok={state?.ok} error={state?.error ?? null} success={state?.ok ? 'Salvato.' : undefined} />
      </div>
    </form>
  );
}

export function PdfUploadForm({
  docId,
  storageObjectKey,
  pdfFileName,
  pdfFileSizeBytes,
  storageConfigured,
  uploadAction,
}: {
  docId: string;
  storageObjectKey: string | null;
  pdfFileName: string | null;
  pdfFileSizeBytes?: number | null;
  storageConfigured: boolean;
  uploadAction: UploadPdfAction;
  prepareUploadFn?: PrepareUploadFn;
  confirmUploadFn?: ConfirmUploadFn;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [state, formAction, isPending] = useActionState(
    async (_prev: unknown, fd: FormData) => {
      if (!storageConfigured) {
        return { ok: false, info: 'Storage non configurato. Nessun upload verrà completato.' };
      }
      const file = fd.get('file');
      if (!file || !(file instanceof File) || file.size === 0) {
        return { ok: false, error: 'Seleziona un file PDF valido (non vuoto, max 25 MB).' };
      }
      return await uploadAction(docId, fd);
    },
    null,
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const sizeLabel = (n?: number | null) => {
    if (!n || n <= 0) return null;
    if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    return `${(n / 1024).toFixed(1)} KB`;
  };

  return (
    <div className="space-y-5">
      {storageObjectKey ? (
        <div className="rounded-xl border border-av-green-deep/30 bg-av-green/[0.05] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-green-deep/40 bg-av-green/10 text-av-green">
              <FileText className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">
                {pdfFileName || 'File associato'}
              </p>
              <p className="mt-0.5 text-[11px] font-mono text-av-muted break-all">
                {storageObjectKey}
                {pdfFileSizeBytes && pdfFileSizeBytes > 0 ? (
                  <span className="ml-3 text-[10px] uppercase tracking-[0.14em] text-av-muted/80">
                    {sizeLabel(pdfFileSizeBytes)}
                  </span>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-av-line bg-av-bg-2/40 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-surface/50 text-av-muted">
              <Upload className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                Nessun PDF associato
              </p>
              <p className="mt-0.5 text-[11px] text-av-muted/90">
                {storageConfigured
                  ? 'Seleziona un file dal tuo dispositivo per associare il documento PDF (max 25 MB, application/pdf).'
                  : 'Storage non configurato. Puoi creare la bozza ma nessun upload verrà completato. Configura BLOB_READ_WRITE_TOKEN su Vercel o locale .env.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form action={formAction as any} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
            File PDF
          </label>
          <div className="rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-3">
            <input
              ref={fileRef}
              name="file"
              type="file"
              required
              accept=".pdf,application/pdf"
              disabled={!storageConfigured || isPending}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-av-green/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-av-green hover:file:bg-av-green/15 disabled:opacity-60"
            />
          </div>
          {selectedFile ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
              <FileText className="h-3.5 w-3.5 text-av-green" />
              {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!storageConfigured || isPending}
            className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {storageObjectKey ? 'Sostituisci PDF' : 'Carica PDF'}
          </button>

          <FieldMessage
            ok={state?.ok}
            error={state?.error ?? null}
            success={state?.ok ? [state?.info ? state.info : 'PDF caricato correttamente. Ricaricamento...'].filter(Boolean).join(' ').trim() : undefined}
          />
        </div>
      </form>

      {state?.ok && typeof window !== 'undefined' ? (
        <span className="hidden" ref={() => {
          if (state?.ok && typeof window !== 'undefined') {
            setTimeout(() => { if (typeof location !== 'undefined') location.reload(); }, 1200);
          }
        }} />
      ) : null}
    </div>
  );
}

export function ResearchDocDeleteClientButton({
  docId,
  docTitle,
  deleteAction,
}: {
  docId: string;
  docTitle?: string | null;
  deleteAction: DeleteAction;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(deleteAction, null);
  const redirectDone = useRef(false);

  if (state?.ok && !redirectDone.current && typeof window !== 'undefined') {
    redirectDone.current = true;
    setTimeout(() => {
      if (typeof location !== 'undefined') {
        const url = new URL(location.href);
        if (url.pathname.startsWith('/admin/research/') && url.pathname.split('/').filter(Boolean).length > 2) {
          location.href = '/admin/research';
        } else {
          location.reload();
        }
      }
    }, 900);
  }

  return (
    <div className="inline-block">
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          title="Elimina definitivamente ricerca e PDF"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/[0.05] px-3 py-2 text-[11px] font-semibold text-red-300 transition-colors hover:bg-red-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Elimina
        </button>
      ) : (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/[0.05] p-4 space-y-3 max-w-md">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">
              <XCircle className="h-4.5 w-4.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm font-semibold text-white">
                Eliminare definitivamente questa ricerca e il relativo PDF?
              </p>
              {docTitle ? (
                <p className="mt-1 text-[11px] text-av-muted truncate max-w-xs">
                  {docTitle}
                </p>
              ) : null}
              <p className="mt-2 text-[11px] leading-relaxed text-red-200/90">
                L&apos;operazione non è reversibile. Il file su Vercel Blob e il
                record sul database verranno rimossi in modo permanente.
              </p>
            </div>
          </div>
          <form action={formAction as any} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="id" value={docId} />
            <button
              type="submit"
              disabled={isPending}
              className="!py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 btn-primary bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-100 disabled:opacity-60 shadow-none"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Conferma eliminazione
            </button>
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
              className="!py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 btn-ghost disabled:opacity-60"
            >
              Annulla
            </button>
          </form>
          {state?.ok ? (
            <p className="text-[11px] font-semibold text-av-green inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {state.info || 'Eliminazione completata. Reindirizzamento...'}
            </p>
          ) : state?.error ? (
            <p className="text-[11px] font-semibold text-red-300 inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              {state.error}
              {state?.info ? <span className="block text-red-200/80">{state.info}</span> : null}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
