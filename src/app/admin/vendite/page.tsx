import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { ShoppingBag } from 'lucide-react';
import { getSalesState, isSalesStorageConfigured } from '@/lib/sales/sales-store';
import VenditeManager from './vendite-manager';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Gestione vendite',
  description: 'Disponibilità e quantità commerciali dei prodotti AV-INVEST Research.',
  robots: { index: false, follow: false },
};

export default async function AdminVenditePage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent('/admin/vendite'));
  if (!isAdminSession(session)) notFound();

  const [initial, storageConfigured] = await Promise.all([
    getSalesState(),
    Promise.resolve(isSalesStorageConfigured()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-av-green" aria-hidden="true" />
            Gestione vendite
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-av-muted/90">
          Apri, sospendi o riapri le vendite e imposta manualmente il numero di accessi
          offerti ai nuovi clienti. Le modifiche sono salvate su Vercel Blob privato e
          pubblicate sul sito senza deploy.
        </p>
      </div>

      <VenditeManager initial={initial} storageConfigured={storageConfigured} />
    </div>
  );
}
