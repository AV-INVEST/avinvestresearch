import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import GlassCard from '@/components/ui/GlassCard';
import { BookOpen, AlertTriangle, FileText, Package } from 'lucide-react';
import { getStorageStatus, getTradingStarterStream } from '@/lib/storage';
import TradingStarterUploadForm from './trading-starter-upload-form';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'AV Trading Starter',
  description: 'Caricamento file privato guida PDF AV Trading Starter.',
};

type FilePresence = { present: boolean; sizeBytes?: number | null; corrupted?: boolean };

async function getFilePresence(): Promise<FilePresence> {
  try {
    const res = await getTradingStarterStream('pdf');
    if (!res.ok) {
      return { present: false };
    }
    const size = typeof res.contentLength === 'number' ? res.contentLength : null;
    if (size !== null && size <= 0) {
      return { present: false, sizeBytes: size, corrupted: true };
    }
    return { present: true, sizeBytes: size };
  } catch {
    return { present: false };
  }
}

export default async function AdminTradingStarterPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect('/login?callbackUrl=' + encodeURIComponent('/admin/trading-starter'));
  if (!isAdminSession(session as any)) notFound();

  const storageStatus = getStorageStatus();
  const pdfPresence = await getFilePresence();
  const totalFiles = pdfPresence.present ? 1 : 0;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
            <span className="flex items-center gap-2">
              <BookOpen className="h-7 w-7 text-av-green" aria-hidden="true" />
              AV Trading Starter
            </span>
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-av-green">
            <Package className="h-3 w-3" aria-hidden="true" />
            Entry-level · One-time
          </span>
        </div>
        <p className="mt-2 text-sm text-av-muted/90 max-w-2xl leading-relaxed">
          Carica o sostituisci la guida PDF privata che gli utenti ricevono dopo l&apos;acquisto
          andato a buon fine. Il file è conservato su Vercel Blob privato e accessibile
          esclusivamente dalla rotta server protetta (nessun URL pubblico o permanente).
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-surface/60 px-2.5 py-1 text-av-muted">
            <FileText className="h-3 w-3 text-av-green" aria-hidden="true" />
            Guida PDF:{' '}
            {pdfPresence.corrupted
              ? <span className="text-red-300">File non valido o vuoto — ricaricalo</span>
              : pdfPresence.present ? 'Caricata' : 'Assente'}
            {pdfPresence.sizeBytes && pdfPresence.sizeBytes > 0 ? (
              <span className="text-av-green ml-1">
                {(pdfPresence.sizeBytes / (1024 * 1024)).toFixed(2)} MB
              </span>
            ) : null}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-surface/60 px-2.5 py-1 text-av-muted">
            {totalFiles}/1 file disponibili
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
                Puoi selezionare il file dal pannello ma nessun upload fisico verrà eseguito finché
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

      <div className="grid gap-6 lg:grid-cols-1">
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-white mb-4">
            Guida PDF AV Trading Starter
          </h2>
          <TradingStarterUploadForm
            storageConfigured={storageStatus.configured}
            filePresent={pdfPresence.present}
            filePresentSizeBytes={pdfPresence.sizeBytes ?? null}
          />
        </GlassCard>
      </div>

      <GlassCard className="p-4 sm:p-5 text-xs text-av-muted/90 space-y-2 leading-relaxed border-av-line/80 bg-av-surface/40">
        <p className="font-semibold text-white/90 uppercase tracking-[0.14em] text-[10px]">
          Note operative
        </p>
        <ul className="space-y-1.5 list-disc pl-4 marker:text-av-green/60">
          <li>
            Chiave storage fissa — nessun database ProductAsset in questa fase:
            <code className="mx-1 font-mono text-av-green/90 bg-av-bg-2/60 px-1 rounded border border-av-line/80">
              products/av-trading-starter/AV-Trading-Starter.pdf
            </code>
            .
          </li>
          <li>Ogni nuovo upload sovrascrive la versione precedente (stessa chiave).</li>
          <li>Limiti: Guida PDF ≤ 25 MB.</li>
          <li>
            La rotta <code className="font-mono">/api/products/trading-starter/download</code>{' '}
            verifica sempre un <code className="font-mono">Purchase</code> con{' '}
            <code className="font-mono">status=succeeded</code> e{' '}
            <code className="font-mono">productSlug=trading-starter</code> prima di erogare lo stream
            (admin bypass). Rate limit: 3 download ogni 60 minuti per account.
          </li>
        </ul>
      </GlassCard>
    </div>
  );
}
