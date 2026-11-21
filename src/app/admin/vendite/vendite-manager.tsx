'use client';

import { useEffect, useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, Minus, Plus } from 'lucide-react';
import { updateSaleProduct } from './actions';
import {
  MAX_SALE_QUANTITY,
  SALE_PRODUCT_KEYS,
  clampQuantity,
  type SaleProductKey,
  type SalesState,
} from '@/lib/sales/sales-shared';

const PRODUCT_META: Record<SaleProductKey, { title: string; note: string }> = {
  'market-lens': { title: 'AV Market Lens', note: 'Indicatore one-time' },
  foundations: { title: 'AV Foundations', note: 'Videocorso · analisi tecnica da zero' },
  'trading-lab': { title: 'AV Trading Lab', note: 'Videocorso · metodo operativo avanzato' },
  'complete-academy': {
    title: 'AV Complete Academy',
    note: 'Bundle: controlli indipendenti, l\u2019acquisto e l\u2019accesso ai due corsi restano invariati',
  },
};

interface Props {
  initial: SalesState;
  storageConfigured: boolean;
}

export default function VenditeManager({ initial, storageConfigured }: Props) {
  const [state, setState] = useState<SalesState>(initial);
  const [drafts, setDrafts] = useState<Record<SaleProductKey, string>>(() => toDrafts(initial));
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savingKey, setSavingKey] = useState<SaleProductKey | null>(null);

  useEffect(() => {
    setDrafts(toDrafts(state));
  }, [state]);

  const apply = (key: SaleProductKey, patch: { available?: boolean; quantity?: number | null }) => {
    if (!storageConfigured || isPending) return;
    setSavingKey(key);
    setBanner(null);
    startTransition(async () => {
      const res = await updateSaleProduct(key, patch);
      if (res.ok && res.state) {
        setState(res.state);
        setBanner({ ok: true, text: `Modifiche salvate per ${PRODUCT_META[key].title}.` });
      } else {
        setBanner({ ok: false, text: res.error ?? 'Salvataggio non riuscito.' });
      }
      setSavingKey(null);
    });
  };

  const commitQuantity = (key: SaleProductKey) => {
    const raw = drafts[key].trim();
    const quantity = raw === '' ? null : clampQuantity(raw);
    const current = state.products[key].quantity;
    if (quantity === current) {
      setDrafts((d) => ({ ...d, [key]: quantity === null ? '' : String(quantity) }));
      return;
    }
    apply(key, { quantity });
  };

  const step = (key: SaleProductKey, delta: 1 | -1) => {
    const current = state.products[key].quantity;
    if (delta === -1 && current === null) return;
    const base = current ?? 0;
    const next = Math.min(MAX_SALE_QUANTITY, Math.max(0, base + delta));
    apply(key, { quantity: next });
  };

  return (
    <div className="space-y-5">
      {!storageConfigured ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <p className="leading-relaxed">
            Storage Vercel Blob non configurato (<code className="text-amber-100">BLOB_READ_WRITE_TOKEN</code>).
            Le modifiche non possono essere salvate in modo persistente finché la variabile non è impostata.
          </p>
        </div>
      ) : null}

      {banner ? (
        <p
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            banner.ok ? 'text-av-green' : 'text-red-300'
          }`}
        >
          {banner.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {banner.text}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {SALE_PRODUCT_KEYS.map((key) => {
          const meta = PRODUCT_META[key];
          const sale = state.products[key];
          const saving = isPending && savingKey === key;
          const closed = !sale.available || sale.quantity === 0;

          return (
            <div
              key={key}
              className="relative flex h-full flex-col gap-4 rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-white break-words">
                    {meta.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-av-muted break-words">
                    {meta.note}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sale.available}
                  aria-label={`Disponibilità ${meta.title}`}
                  disabled={!storageConfigured || isPending}
                  onClick={() => apply(key, { available: !sale.available })}
                  className={[
                    'relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors disabled:opacity-50',
                    sale.available
                      ? 'border-av-green-deep/60 bg-av-green/30'
                      : 'border-av-line bg-av-bg-2',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'inline-block h-4 w-4 transform rounded-full transition-transform',
                      sale.available
                        ? 'translate-x-6 bg-av-green'
                        : 'translate-x-1 bg-av-muted',
                    ].join(' ')}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                    closed
                      ? 'border-av-line bg-av-bg-2/70 text-av-muted'
                      : 'border-av-green-deep/40 bg-av-green/10 text-av-green',
                  ].join(' ')}
                >
                  {closed ? 'Vendite chiuse' : 'Disponibile'}
                </span>
                {saving ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-av-muted">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvataggio...
                  </span>
                ) : null}
              </div>

              <div className="mt-auto">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                  Accessi impostati manualmente
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(key, -1)}
                    disabled={!storageConfigured || isPending || sale.quantity === null}
                    aria-label={`Riduci accessi ${meta.title}`}
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-bg-2/60 text-white transition-colors hover:border-av-green-deep/50 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_SALE_QUANTITY}
                    value={drafts[key]}
                    placeholder="Non configurato"
                    disabled={!storageConfigured}
                    aria-label={`Numero di accessi ${meta.title}`}
                    onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                    onBlur={() => commitQuantity(key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => step(key, 1)}
                    disabled={!storageConfigured || isPending}
                    aria-label={`Aumenta accessi ${meta.title}`}
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-bg-2/60 text-white transition-colors hover:border-av-green-deep/50 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-av-line bg-av-bg-2/40 px-4 py-3 text-xs leading-relaxed text-av-muted">
        <Info className="mt-0.5 h-4 w-4 flex-none text-av-green" />
        <p>
          La quantità è decisa esclusivamente dall&apos;amministratore: non viene decrementata
          dopo gli acquisti, non è sincronizzata con Stripe e non alimenta alcun magazzino.
          Lascia il campo vuoto per non mostrare alcun numero sul sito. Con switch su OFF o
          quantità a zero, le CTA diventano &laquo;Non disponibile&raquo; ma gli accessi di chi
          ha già acquistato restano invariati.
        </p>
      </div>
    </div>
  );
}

function toDrafts(state: SalesState): Record<SaleProductKey, string> {
  const out = {} as Record<SaleProductKey, string>;
  for (const key of SALE_PRODUCT_KEYS) {
    const q = state.products[key].quantity;
    out[key] = q === null ? '' : String(q);
  }
  return out;
}
