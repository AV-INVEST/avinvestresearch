import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import GlassCard from '@/components/ui/GlassCard';
import { Eye, AlertTriangle, FileCode, FileText, Package } from 'lucide-react';
import { getStorageStatus, getMarketLensStream } from '@/lib/storage';
import MarketLensUploadForm from './market-lens-upload-form';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'AV Market Lens',
  description: 'Caricamento file privati AV Market Lens (Pine Script + Guida PDF).',
};

type FilePresence = { present: boolean; sizeBytes?: number | null };

async function getFilePresence(kind: 'indicator' | 'guide'): Promise<FilePresence> {
  try {
    const res = await getMarketLensStream(kind);
    if (!res.ok) {
      return { present: false };
    }
    return { present: true, sizeBytes: res.contentLength ?? null };
  } catch {
    return { present: false };
  }
}

export default async function AdminMarketLensPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent('/admin/market-lens'));
  if (!isAdminSession(session as any)) notFound();

  const storageStatus = getStorageStatus();
  const [indicatorPresence, guidePresence] = await Promise.all([
    getFilePresence('indicator'),
    getFilePresence('guide'),
  ]);

  const totalFiles = (indicatorPresence.present ? 1 : 0) + (guidePresence.present ? 1 : 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            <span className="flex items-center gap-2">
              <Eye className="h-7 w-7 text-av-green" aria-hidden="true" />
              AV Market Lens
            </span>
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-green">
            <Package className="h-3 w-3" aria-hidden="true" />
            Prodotto digitale one-time
          </span>
        </div>
        <p className="mt-2 text-sm text-av-muted/90 max-w-2xl leading-relaxed">
          Carica o sostituisci i due file privati che gli utenti ricevono dopo l&apos;acquisto
          andato a buon fine. Entrambi i file sono conservati su Vercel Blob privato e accessibili
          esclusivamente dalle rotte server protette (nessun URL pubblico o permanente).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-surface/60 px-2.5 py-1 text-av-muted">
            <FileCode className="h-3 w-3 text-av-green" aria-hidden="true" />
            Pine Script: {indicatorPresence.present ? 'Caricato' : 'Assente'}
            {indicatorPresence.sizeBytes ? (
              <span className="text-av-green ml-1">
                {(indicatorPresence.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-surface/60 px-2.5 py-1 text-av-muted">
            <FileText className="h-3 w-3 text-av-green" aria-hidden="true" />
            Guida PDF: {guidePresence.present ? 'Caricata' : 'Assente'}
            {guidePresence.sizeBytes ? (
              <span className="text-av-green ml-1">
                {(guidePresence.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-surface/60 px-2.5 py-1 text-av-muted">
            {totalFiles}/2 file disponibili
          </span>
        </div>
      </div>

      {!storageStatus.configured ? (
        <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-av-yellow">Storage privato non configurato</p>
              <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
                Puoi selezionare i file dal pannello ma nessun upload fisico verrà eseguito finché
                non configuri il token di accesso Vercel Blob. Nessun fallback pubblico.
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

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            1 · Indicatore TradingView
          </h2>
          <MarketLensUploadForm
            kind="indicator"
            storageConfigured={storageStatus.configured}
            filePresent={indicatorPresence.present}
            filePresentSizeBytes={indicatorPresence.sizeBytes ?? null}
          />
        </GlassCard>

        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            2 · Guida PDF all&apos;utilizzo
          </h2>
          <MarketLensUploadForm
            kind="guide"
            storageConfigured={storageStatus.configured}
            filePresent={guidePresence.present}
            filePresentSizeBytes={guidePresence.sizeBytes ?? null}
          />
        </GlassCard>
      </div>

      <GlassCard className="p-4 sm:p-5 text-xs text-av-muted/90 space-y-2 leading-relaxed border-av-line/80 bg-av-surface/40">
        <p className="font-semibold text-white/90 uppercase tracking-[0.14em] text-[10px]">
          Note operative
        </p>
        <ul className="space-y-1.5 list-disc pl-4 marker:text-av-green/60">
          <li>
            Chiavi storage fisse — nessun database ProductAsset in questa fase:
            <code className="mx-1 font-mono text-av-green/90 bg-av-bg-2/60 px-1 rounded border border-av-line/80">
              products/av-market-lens/AV-Market-Lens.pine
            </code>
            e
            <code className="mx-1 font-mono text-av-green/90 bg-av-bg-2/60 px-1 rounded border border-av-line/80">
              products/av-market-lens/AV-Market-Lens-Guida.pdf
            </code>
            .
          </li>
          <li>Ogni nuovo upload sovrascrive la versione precedente (stessa chiave).</li>
          <li>Limiti: Pine Script ≤ 2 MB · Guida PDF ≤ 25 MB.</li>
          <li>
            Le rotte <code className="font-mono">/api/products/market-lens/download/*</code>{' '}
            verificano sempre un <code className="font-mono">Purchase</code> con{' '}
            <code className="font-mono">status=succeeded</code> e{' '}
            <code className="font-mono">productSlug=market-lens</code> prima di erogare lo stream.
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
