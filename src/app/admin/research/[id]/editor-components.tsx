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
} from 'lucide-react';

type PublishAction = (id: string) => Promise<{ ok: boolean; error?: string }>;
type SaveMetaAction = (id: string, formData: FormData) => Promise<{ ok: boolean; error?: string }>;
type PrepareUploadFn = (formData: FormData) => Promise<any>;
type ConfirmUploadFn = (formData: FormData) => Promise<any>;

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
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const published = status === 'PUBLISHED';

  return (
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
              setMsg({ ok: r.ok, text: r.ok ? 'Stato aggiornato: pubblicata.' : r.error || 'Errore.' });
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
  prepareUploadFn,
  confirmUploadFn,
}: {
  docId: string;
  storageObjectKey: string | null;
  pdfFileName: string | null;
  pdfFileSizeBytes?: number | null;
  storageConfigured: boolean;
  prepareUploadFn: PrepareUploadFn;
  confirmUploadFn: ConfirmUploadFn;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<
    | { kind: 'idle' }
    | { kind: 'pending' }
    | { kind: 'error'; msg: string }
    | { kind: 'success'; msg: string }
    | { kind: 'noop'; msg: string }
  >({ kind: 'idle' });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = selectedFile || (fileRef.current?.files?.[0] ?? null);
    if (!f) {
      setStatus({ kind: 'error', msg: 'Seleziona un file PDF da caricare.' });
      return;
    }
    if (f.type && f.type !== 'application/pdf') {
      setStatus({ kind: 'error', msg: 'Solo file application/pdf sono accettati.' });
      return;
    }
    if (f.size > 25 * 1024 * 1024) {
      setStatus({ kind: 'error', msg: 'File troppo grande (max 25 MB).' });
      return;
    }
    if (!storageConfigured) {
      setStatus({
        kind: 'noop',
        msg:
          'Storage non configurato. I metadati sono validi ma l\'upload fisico non è stato eseguito. Nessun file è stato scritto su storage permanente.',
      });
      return;
    }

    setStatus({ kind: 'pending' });
    try {
      const prepFd = new FormData();
      prepFd.set('fileName', f.name);
      prepFd.set('contentLength', String(f.size));
      const prep = await prepareUploadFn(prepFd);
      if (!prep?.ok) {
        setStatus({ kind: 'error', msg: prep?.message || 'Impossibile preparare upload.' });
        return;
      }
      if (prep.uploadMethod === 'DIRECT_PUT') {
        const confirmFd = new FormData();
        confirmFd.set('storageObjectKey', prep.storageKey || '');
        confirmFd.set('pdfFileName', f.name);
        confirmFd.set('contentLength', String(f.size));
        const conf = await confirmUploadFn(confirmFd);
        if (conf?.ok) {
          setStatus({
            kind: 'success',
            msg:
              'Riferimento salvato. Integrazione upload fisico con signed URL provider attuale non attiva in questa build (placeholder DIRECT_PUT).',
          });
          if (fileRef.current) fileRef.current.value = '';
          setSelectedFile(null);
          setTimeout(() => location.reload(), 1400);
        } else {
          setStatus({ kind: 'error', msg: conf?.error || 'Errore conferma upload.' });
        }
        return;
      }
      setStatus({ kind: 'noop', msg: `Metodo upload ${prep.uploadMethod} non implementato. Nessun file caricato.` });
    } catch (err: any) {
      setStatus({ kind: 'error', msg: err?.message || 'Errore upload.' });
    }
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
              <p className="text-sm font-semibold text-white">
                {pdfFileName || 'File associato'}
              </p>
              <p className="mt-0.5 text-[11px] font-mono text-av-muted break-all">
                {storageObjectKey}
                {pdfFileSizeBytes && pdfFileSizeBytes > 0 ? (
                  <span className="ml-3 text-[10px] uppercase tracking-[0.14em] text-av-muted/80">
                    {(pdfFileSizeBytes / 1024).toFixed(1)} KB
                  </span>
                ) : null}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled
                  className="btn-ghost !py-1.5 !px-3 text-[11px] items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
                >
                  <Unlink className="h-3.5 w-3.5" />
                  Sostituisci / rimuovi (solo storage configurato)
                </button>
              </div>
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
                  : 'Storage non configurato. Puoi selezionare un file per testare la validazione, ma nessun upload verrà completato.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
            File PDF
          </label>
          <div className="rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-3">
            <input
              ref={fileRef}
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-av-green/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-av-green hover:file:bg-av-green/15"
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
            disabled={status.kind === 'pending'}
            className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60"
          >
            {status.kind === 'pending' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Carica / sostituisci PDF
          </button>

          {status.kind === 'error' ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
              <AlertCircle className="h-3.5 w-3.5" /> {status.msg}
            </p>
          ) : null}
          {status.kind === 'success' ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-av-green">
              <CheckCircle2 className="h-3.5 w-3.5" /> {status.msg}
            </p>
          ) : null}
          {status.kind === 'noop' ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-av-yellow">
              <AlertCircle className="h-3.5 w-3.5" /> {status.msg}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
