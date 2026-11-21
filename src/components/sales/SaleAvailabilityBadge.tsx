'use client';

import { CheckCircle2, Lock } from 'lucide-react';
import {
  isSalePurchasable,
  saleAvailabilityLabel,
  type SaleAvailabilityKind,
  type SaleProductState,
} from '@/lib/sales/sales-shared';

type Tone = 'green' | 'gold';

const OPEN_STYLES: Record<Tone, string> = {
  green:
    'border-av-green-deep/40 bg-av-green/10 text-av-green shadow-glow-green-sm',
  gold: 'border-[#C9A961]/40 bg-[#C9A961]/10 text-[#EBD9A8]',
};

const LOCKED_STYLES =
  'border-av-line bg-av-bg-2/70 text-av-muted';

/**
 * Badge commerciale mostrato accanto alla CTA di acquisto.
 * - Switch ON con quantità configurata: numero di accessi deciso dall'admin
 *   (non è un conteggio automatico degli acquisti).
 * - Switch OFF oppure quantità a zero: "Vendite chiuse".
 * - Switch ON senza quantità configurata: nessun badge.
 *
 * `kind` distingue AV Market Lens (download) dai videocorsi (posti).
 */
export default function SaleAvailabilityBadge({
  sale,
  tone = 'green',
  kind = 'seat',
}: {
  sale: SaleProductState;
  tone?: Tone;
  kind?: SaleAvailabilityKind;
}) {
  if (isSalePurchasable(sale)) {
    if (sale.quantity === null || sale.quantity <= 0) return null;
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${OPEN_STYLES[tone]}`}
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        {saleAvailabilityLabel(kind, sale.quantity)}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${LOCKED_STYLES}`}
    >
      <Lock className="h-3 w-3" />
      Vendite chiuse
    </span>
  );
}
