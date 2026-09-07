'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader2 } from 'lucide-react';
import { createResearchDocAction } from './actions';

export function CreateDocForm() {
  const router = useRouter();
  const [state, createAction, isPending] = useActionState(async (_: unknown, fd: FormData) => {
    const res = await createResearchDocAction(null, fd);
    if (res.ok && res.id) {
      router.push(`/admin/research/${res.id}`);
      router.refresh();
    }
    return res;
  }, null);

  return (
    <form action={createAction as any} className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-av-muted mb-1.5">
          Titolo
        </label>
        <input
          name="title"
          required
          maxLength={200}
          placeholder="es. Market Note - Marzo 2026"
          className="w-full rounded-xl border border-av-line bg-av-bg-2/60 px-3.5 py-2.5 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none focus:ring-2 focus:ring-av-green/20"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Crea documento
      </button>
      {state && !state.ok && state.error ? (
        <p className="text-[11px] font-semibold text-red-400">{state.error}</p>
      ) : null}
    </form>
  );
}
