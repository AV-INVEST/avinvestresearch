'use client';

import { useRef, useState, useActionState } from 'react';
import { Trash2, XCircle, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { deleteResearchDocAdmin } from '@/lib/admin/research-admin';
import type { ActionResult } from '@/lib/admin/research-admin';

type DeleteAction = (prevState: unknown, formData: FormData) => Promise<ActionResult>;

export function AdminResearchDeleteButton({
  docId,
  docTitle,
}: {
  docId: string;
  docTitle?: string | null;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteResearchDocAdmin as DeleteAction,
    null as ActionResult | null,
  );
  const redirectDone = useRef(false);

  if (state?.ok && !redirectDone.current && typeof window !== 'undefined') {
    redirectDone.current = true;
    setTimeout(() => {
      if (typeof location !== 'undefined') {
        location.reload();
      }
    }, 700);
  }

  return (
    <div className="inline-block">
      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          title="Elimina definitivamente ricerca e PDF"
          className="btn-ghost !py-2 !px-3 text-[12px] items-center justify-center gap-1.5 text-red-300 hover:text-red-200 hover:bg-red-500/10 border-red-500/20"
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
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
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
              {state.info || 'Eliminazione completata. Aggiornamento elenco...'}
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
