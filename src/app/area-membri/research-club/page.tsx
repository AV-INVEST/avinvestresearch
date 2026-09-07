import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma, isDatabaseConfigured } from '@/lib/db/prisma';
import { getResearchClubEntitlement } from '@/lib/entitlements';
import GlassCard from '@/components/ui/GlassCard';
import ResearchClubCheckoutButton from '@/components/sections/ResearchClubCheckoutButton';
import {
  Sparkles,
  FileText,
  CalendarDays,
  ArrowRight,
  Lock,
  CheckCircle2,
  ShieldAlert,
  XCircle,
  Crown,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research Club - Area membri',
  description: 'Archivio ricerche e analisi riservate ai membri AV Research Club.',
  alternates: { canonical: '/area-membri/research-club' },
};

export const dynamic = 'force-dynamic';

function formatDate(d: Date | string | null) {
  if (!d) return '—';
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function formatSize(bytes: number | null | undefined) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const GOLD = {
  text: 'text-[#C9A961]',
  border: 'border-[#C9A961]/40',
  bg: 'bg-[#C9A961]/10',
  ring: 'ring-[#C9A961]/20',
} as const;

export default async function ResearchClubPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/research-club');
    redirect(target);
  }

  const rc = await getResearchClubEntitlement(session.user.id, session.user.email);
  const dbOk = isDatabaseConfigured();

  if (!rc.accessGranted || !dbOk) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p
              className={`inline-flex items-center gap-2 rounded-full border ${GOLD.border} ${GOLD.bg} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${GOLD.text}`}
            >
              <Crown className={`h-3.5 w-3.5 ${GOLD.text}`} />
              AV Research Club
            </p>
            <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
              Abbonamento non attivo
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base max-w-2xl">
              I contenuti dell&apos;AV Research Club sono riservati ai soli
              abbonati attivi. Analisi di mercato, ricerche su aziende Small
              &amp; Mid Cap, scenari e catalizzatori con aggiornamenti settimanali.
            </p>
          </div>
        </div>

        <GlassCard
          className={`overflow-hidden p-6 sm:p-8 border ${GOLD.border}/50`}
          style={{
            backgroundImage:
              'radial-gradient(1200px 400px at 80% -10%, rgba(201,169,97,0.06), transparent 60%)',
          }}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
            <div className="space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${GOLD.bg} border ${GOLD.border} text-[11px] font-semibold uppercase tracking-[0.16em] ${GOLD.text}`}>
                <Sparkles className="h-3.5 w-3.5" />
                Contenuti premium
              </div>
              <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
                Unisciti ad AV Research Club
              </h2>
              <ul className="space-y-3 text-sm text-av-muted/95">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-4 w-4 flex-none mt-0.5 ${GOLD.text}`} />
                  <span>
                    <strong className="text-white">Weekly Market Radar</strong>
                    <span className="text-av-muted">
                      {' '}— panoramica settimanale con scenari e rischi.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-4 w-4 flex-none mt-0.5 ${GOLD.text}`} />
                  <span>
                    <strong className="text-white">Small &amp; Mid Cap Focus</strong>
                    <span className="text-av-muted">
                      {' '}— ricerche verticali su aziende, catalizzatori e tesi.
                    </span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`h-4 w-4 flex-none mt-0.5 ${GOLD.text}`} />
                  <span>
                    <strong className="text-white">Archivio ultimi 3 mesi</strong>
                    <span className="text-av-muted">
                      {' '}— le ultime 12 ricerche pubblicate, sempre disponibili.
                    </span>
                  </span>
                </li>
              </ul>
              <p className="text-xs leading-relaxed text-av-muted/85">
                Disdici quando vuoi. In caso di disdetta, l&apos;accesso resta
                attivo fino alla fine del periodo già pagato.
              </p>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-av-line bg-av-bg-2/80 p-5">
                <div className="flex items-baseline gap-2">
                  <span className={`font-display text-4xl font-semibold ${GOLD.text}`}>
                    19,90
                  </span>
                  <span className="text-sm text-av-muted">€ / mese</span>
                </div>
                <p className="mt-2 text-[11px] text-av-muted/85">
                  Abbonamento ricorrente. Prezzo IVA inclusa ove applicabile.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <ResearchClubCheckoutButton
                    label="full"
                    returnTo="/area-membri/research-club"
                  />
                </div>
                <Link
                  href="/#research-club"
                  className="btn-ghost w-full items-center justify-center gap-1.5 !py-2 text-xs"
                >
                  Torna alla pagina prodotto
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="rounded-2xl border border-av-line bg-av-bg-2/60 p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-4 w-4 flex-none text-av-yellow mt-0.5" />
                  <p className="text-[11px] leading-relaxed text-av-muted/95">
                    L&apos;accesso ai PDF è strettamente personale e legato al
                    tuo account. Nessun link pubblico permanente viene esposto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const docs = dbOk
    ? await prisma.researchDoc.findMany({
        where: { status: 'PUBLISHED' },
        orderBy: [
          { publishedAt: { sort: 'desc', nulls: 'last' } },
          { publicationDate: { sort: 'desc', nulls: 'last' } },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          publishedAt: true,
          publicationDate: true,
          pdfFileName: true,
          pdfFileSizeBytes: true,
          storageObjectKey: true,
        },
        take: 24,
      })
    : [];

  const nextDate = rc.nextDate;
  const nextDateLabel =
    rc.status === 'cancel_at_period_end'
      ? 'Accesso disponibile fino'
      : 'Prossimo rinnovo';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className={`inline-flex items-center gap-2 rounded-full border ${GOLD.border} ${GOLD.bg} px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${GOLD.text}`}
          >
            <Crown className={`h-3.5 w-3.5 ${GOLD.text}`} />
            AV Research Club · Archivio ricerche
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Ricerche recenti
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base max-w-2xl">
            Le ultime pubblicazioni dell&apos;AV Research Club. Vengono mantenute
            in modo permanente le ultime 12 ricerche (circa 3 mesi).
          </p>
        </div>

        <div className="flex flex-col gap-2 items-stretch sm:items-end">
          <GlassCard className="p-4 overflow-hidden min-w-[260px]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${GOLD.text}`}>
                  19,90 € / mese
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {nextDateLabel}:{' '}
                  <span className="text-av-muted text-xs sm:text-sm font-normal">
                    {formatDate(nextDate)}
                  </span>
                </p>
              </div>
              {rc.status === 'active' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-av-green">
                  <CheckCircle2 className="h-3 w-3" /> Attivo
                </span>
              ) : rc.status === 'cancel_at_period_end' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-av-yellow">
                  <XCircle className="h-3 w-3" /> Rinnovo disattivato
                </span>
              ) : rc.status === 'payment_problem' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                  <ShieldAlert className="h-3 w-3" /> Pag. da risolvere
                </span>
              ) : null}
            </div>
            <div className="mt-3 flex gap-2">
              <Link
                href="/area-membri/profilo#research-club"
                className="btn-ghost !py-1.5 !px-3 text-[11px] items-center gap-1.5 flex-1 justify-center"
              >
                Stato abbonamento
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>

      {docs.length === 0 ? (
        <GlassCard className="p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <FileText className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white">
                Nessuna ricerca pubblicata
              </p>
              <p className="mt-1 text-xs text-av-muted">
                L&apos;archivio verrà popolato con la prossima pubblicazione.
                Torna presto o controlla la mail per gli aggiornamenti.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {docs.map((doc, idx) => (
            <GlassCard
              key={doc.id}
              className={`overflow-hidden p-5 sm:p-6 transition-colors hover:border-white/15`}
              style={{
                backgroundImage:
                  idx === 0
                    ? 'radial-gradient(800px 300px at 0% -20%, rgba(201,169,97,0.06), transparent 60%)'
                    : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`inline-flex items-center gap-1.5 rounded-full border ${GOLD.border} ${GOLD.bg} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${GOLD.text}`}>
                  <Sparkles className={`h-2.5 w-2.5 ${GOLD.text}`} />
                  {idx === 0 ? 'Novità · Weekly Research' : 'Weekly Research'}
                </div>
                {doc.pdfFileName && doc.storageObjectKey ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/30 bg-av-green/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                    <FileText className="h-2.5 w-2.5" />
                    PDF
                    {doc.pdfFileSizeBytes
                      ? ` · ${formatSize(doc.pdfFileSizeBytes)}`
                      : ''}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-av-line bg-av-bg-2/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-muted/90">
                    <Lock className="h-2.5 w-2.5" />
                    Nessun file
                  </span>
                )}
              </div>

              <h3 className="mt-4 font-display text-lg font-semibold text-white leading-snug line-clamp-2 min-h-[3.5rem]">
                {doc.title}
              </h3>
              {doc.description ? (
                <p className="mt-2 text-xs leading-relaxed text-av-muted/95 line-clamp-3 min-h-[3rem]">
                  {doc.description}
                </p>
              ) : (
                <div className="mt-2 min-h-[3rem]" />
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-av-muted">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(doc.publishedAt || doc.publicationDate)}
                </span>
                {idx >= 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-av-bg-2/60 border border-av-line px-2 py-0.5">
                    #{docs.length - idx}
                  </span>
                )}
              </div>

              <div className="mt-5">
                {doc.storageObjectKey ? (
                  <Link
                    href={`/api/research-pdf/${doc.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#C9A961]/70 bg-[#0a0906] !py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:border-[#D4B46A] hover:shadow-glow-gold-sm focus-visible:outline-[#C9A961]`}
                    style={{
                      backgroundImage:
                        'linear-gradient(180deg, rgba(201,169,97,0.12), rgba(201,169,97,0.02))',
                    }}
                  >
                    <ExternalLink className={`h-4 w-4 ${GOLD.text}`} />
                    <span>APRI RICERCA</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="btn-ghost w-full items-center justify-center gap-2 !py-2.5 text-sm opacity-60 cursor-not-allowed"
                  >
                    <Lock className="h-4 w-4" />
                    Allegato non disponibile
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
