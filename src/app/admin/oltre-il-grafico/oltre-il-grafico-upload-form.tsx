'use client';

import { useRef, useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import type { OltreIlGraficoUploadResult } from './actions';
import { uploadOltreIlGraficoFile } from './actions';
import { OLTRE_IL_GRAFICO_SIZE_LIMITS } from '@/lib/storage';

type Props = {
  storageConfigured: boolean;
  filePresent: boolean;
  filePresentSizeBytes?: number | null;
};

function sizeLabel(n?: number | null): string | null {
  if (!n || n <= 0) return null;
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(2)} MB`;
  return `${(n / 1024).toFixed(1)} KB`;
}

export default function OltreIlGraficoUploadForm({
  storageConfigured,
  filePresent,
  filePresentSizeBytes,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const mbMax = Math.round(OLTRE_IL_GRAFICO_SIZE_LIMITS.pdf / (1024 * 1024));

  const [state, formAction, isPending] = useActionState(
    async (_prev: OltreIlGraficoUploadResult | null, fd: FormData) => {
      if (!storageConfigured) {
        return { ok: false, error: 'Storage privato non configurato. Nessun upload verrà completato.' };
      }
      const file = fd.get('file');
      if (!file || !(file instanceof File) || file.size === 0) {
        return { ok: false, error: `Seleziona un file PDF valido (non vuoto, max ${mbMax} MB).` };
      }
      return await uploadOltreIlGraficoFile('pdf', fd);
    },
    null,
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (state?.ok) {
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = '';
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]">
          <FileText className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-white">PDF Oltre il Grafico</h3>
          <p className="mt-1 text-xs text-av-muted/90 leading-relaxed">
            Romanzo in formato PDF. Massimo {mbMax} MB. Chiave storage fissa:{' '}
            <code className="font-mono text-[11px] text-[#E4CE96] bg-av-bg-2/60 px-1.5 py-0.5 rounded border border-av-line">
              products/oltre-il-grafico/Oltre-Il-Grafico.pdf
            </code>
          </p>
        </div>
      </div>

      {filePresent ? (
        <div className="rounded-xl border border-[#C9A961]/30 bg-[#C9A961]/[0.05] p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-[#C9A961]/40 bg-[#C9A961]/10 text-[#E4CE96]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">File PDF presente</p>
              <p className="mt-0.5 text-[11px] font-mono text-av-muted break-all">
                Oltre-Il-Grafico.pdf
                {filePresentSizeBytes ? (
                  <span className="ml-3 text-[10px] uppercase tracking-[0.14em] text-av-muted/80">
                    {sizeLabel(filePresentSizeBytes)}
                  </span>
                ) : null}
              </p>
              <p className="mt-1 text-[11px] text-av-muted/80">
                Un nuovo upload sostituirà la versione corrente.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-av-line bg-av-bg-2/40 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-surface/50 text-av-muted">
              <UploadCloud className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">Nessun file caricato</p>
              <p className="mt-0.5 text-[11px] text-av-muted/90">
                {storageConfigured
                  ? 'Seleziona il file PDF del romanzo dal tuo dispositivo.'
                  : 'Storage BLOB_READ_WRITE_TOKEN non configurato. Puoi selezionare il file ma nessun upload sarà completato.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {!storageConfigured ? (
        <div className="rounded-xl border border-av-yellow-deep/30 bg-av-yellow/5 p-3.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 flex-none mt-0.5 text-av-yellow" />
            <div>
              <p className="text-xs font-semibold text-av-yellow">Storage non configurato</p>
              <p className="mt-0.5 text-[11px] text-av-yellow/85 leading-relaxed">
                Configura la variabile d&apos;ambiente <code className="font-mono">BLOB_READ_WRITE_TOKEN</code> in locale o su Vercel per abilitare l&apos;upload.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <form action={formAction as any} className="space-y-4" aria-label="Upload PDF Oltre il Grafico">
        <div>
          <label
            htmlFor="oltre-il-grafico-pdf-file"
            className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5"
          >
            Seleziona file PDF
          </label>
          <div className="rounded-xl border border-av-line bg-av-bg-2/60 px-3 py-3">
            <input
              id="oltre-il-grafico-pdf-file"
              ref={fileRef}
              name="file"
              type="file"
              required
              accept=".pdf,application/pdf"
              disabled={!storageConfigured || isPending}
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#C9A961]/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#E4CE96] hover:file:bg-[#C9A961]/15 disabled:opacity-60"
            />
          </div>
          {selectedFile ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
              <FileText className="h-3.5 w-3.5 text-[#C9A961]" />
              {selectedFile.name} · {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!storageConfigured || isPending}
            className="btn-rc-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-gold-sm disabled:opacity-60"
            aria-busy={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Upload className="h-4 w-4" aria-hidden="true" />
            )}
            {filePresent ? 'Sostituisci PDF' : 'Carica PDF'}
          </button>
          {state && !state.ok && state.error ? (
            <p className="text-xs font-semibold text-red-300 max-w-md" role="alert">
              {state.error}
            </p>
          ) : null}
          {state?.ok && state.message ? (
            <p className="text-xs font-semibold text-[#E4CE96] max-w-md" role="status" aria-live="polite">
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
