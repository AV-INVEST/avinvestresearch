'use client';

import Link from 'next/link';
import { useSales } from '@/lib/sales/sales-client';
import {
  isSalePurchasable,
  saleAvailabilityLabel,
  type SaleAvailabilityKind,
  type SaleProductKey,
} from '@/lib/sales/sales-shared';

interface Entry {
  key: SaleProductKey;
  kind: SaleAvailabilityKind;
  name: string;
  href: string;
  tone: 'green' | 'gold';
}

/**
 * Prodotti mostrati nella Hero. AV Complete Academy è volutamente escluso
 * per evitare sovraffollamento: il bundle mantiene il badge nella sua sezione.
 */
const ENTRIES: Entry[] = [
  { key: 'market-lens', kind: 'download', name: 'AV Market Lens', href: '/#market-lens', tone: 'green' },
  { key: 'foundations', kind: 'seat', name: 'AV Foundations', href: '/#percorsi', tone: 'gold' },
  { key: 'trading-lab', kind: 'seat', name: 'AV Trading Lab', href: '/#percorsi', tone: 'gold' },
];

/** Chip originari mostrati quando non c'è alcuna disponibilità da comunicare. */
const PILLARS = ['Metodo', 'Dati', 'Disciplina'];

interface Item extends Entry {
  label: string;
  closed: boolean;
}

function resolveItems(
  products: Record<SaleProductKey, { available: boolean; quantity: number | null }>,
): Item[] {
  const items: Item[] = [];
  for (const entry of ENTRIES) {
    const sale = products[entry.key];
    const purchasable = isSalePurchasable(sale);
    // OFF oppure quantità a zero: vendite chiuse.
    if (!purchasable) {
      items.push({ ...entry, label: 'VENDITE CHIUSE', closed: true });
      continue;
    }
    // ON senza quantità configurata: nessuna disponibilità numerica da mostrare.
    if (sale.quantity === null || sale.quantity <= 0) continue;
    items.push({ ...entry, label: saleAvailabilityLabel(entry.kind, sale.quantity), closed: false });
  }
  return items;
}

/**
 * Availability Bar premium della Hero. Riusa lo stato commerciale condiviso
 * (`SalesProvider`): nessuna chiamata aggiuntiva, nessun polling.
 */
export default function HeroAvailabilityBar() {
  const sales = useSales();
  const items = resolveItems(sales.products);

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-wrap items-center gap-2 animate-fade-in-up [animation-delay:500ms]">
        {PILLARS.map((p) => (
          <span key={p} className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-av-green" />
            {p}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 animate-fade-in-up [animation-delay:500ms]">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-av-green shadow-glow-green-sm" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-av-muted">
          Disponibilità attuali
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:flex-wrap">
        {items.map((it) => {
          const dotClass = it.closed
            ? 'bg-av-muted/50'
            : it.tone === 'green'
              ? 'bg-av-green shadow-glow-green-sm'
              : 'bg-[#C9A961]';
          const labelClass = it.closed
            ? 'text-av-muted'
            : it.tone === 'green'
              ? 'text-av-green'
              : 'text-[#E4CE96]';
          const boxClass = it.closed
            ? 'border-av-line bg-av-bg-2/40 hover:border-av-line hover:bg-av-surface/70'
            : it.tone === 'green'
              ? 'border-av-green-deep/30 bg-av-green/[0.06] hover:border-av-green-deep/60 hover:bg-av-green/[0.10] hover:shadow-glow-green-sm'
              : 'border-[#C9A961]/25 bg-[#C9A961]/[0.05] hover:border-[#C9A961]/50 hover:bg-[#C9A961]/[0.09]';

          return (
            <Link
              key={it.key}
              href={it.href}
              className={`group flex w-full min-w-0 items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-av-green lg:w-auto ${boxClass}`}
            >
              <span className={`h-1.5 w-1.5 flex-none rounded-full ${dotClass}`} aria-hidden="true" />
              <span className="flex min-w-0 flex-col leading-none">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-av-muted/80">
                  {it.name}
                </span>
                <span className={`mt-1 text-[11px] font-bold uppercase tracking-wide ${labelClass}`}>
                  {it.label}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
