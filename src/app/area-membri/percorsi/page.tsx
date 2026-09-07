import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { siteConfig } from '@/config/siteConfig';
import { getEntitlements, type CourseStatus } from '@/lib/entitlements';
import GlassCard from '@/components/ui/GlassCard';
import PendingPaymentRefresher from '@/components/payment/PendingPaymentRefresher';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Lock,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'I miei percorsi',
  description: 'I tuoi percorsi formativi in AV-INVEST Research.',
  alternates: { canonical: '/area-membri/percorsi' },
};

interface CourseCardData {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
}

export default async function PercorsiPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri/percorsi');
    redirect(target);
  }
  const entitlements = await getEntitlements(session.user.id, session.user.email);

  const baseCourses: CourseCardData[] = [
    {
      slug: siteConfig.courses.foundations.slug,
      title: siteConfig.courses.foundations.title,
      subtitle: siteConfig.courses.foundations.subtitle,
      description: siteConfig.courses.foundations.description,
    },
    {
      slug: siteConfig.courses.tradingLab.slug,
      title: siteConfig.courses.tradingLab.title,
      subtitle: siteConfig.courses.tradingLab.subtitle,
      description: siteConfig.courses.tradingLab.description,
    },
  ];

  const anyAvailable = Object.values(entitlements.courses).some(
    (c) =>
      c.status === 'owned_not_started' ||
      c.status === 'owned_in_progress' ||
      c.status === 'owned_completed',
  );

  function getOwnedCtaLabel(status: CourseStatus): string {
    switch (status) {
      case 'owned_not_started':
        return 'Inizia il percorso';
      case 'owned_in_progress':
        return 'Riprendi la lezione';
      case 'owned_completed':
        return 'Rivedi il percorso';
      default:
        return 'Apri il percorso';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/area-membri"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla Panoramica
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            I miei percorsi
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Gestisci i tuoi percorsi formativi, controlla l&apos;avanzamento e
            riprendi da dove ti eri fermato.
          </p>
        </div>
      </div>

      {!anyAvailable ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
              <Sparkles className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold text-white">
                Non hai ancora acquistato alcun percorso
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
                Scopri i percorsi disponibili sulla pagina principale e
                sblocca l&apos;accesso quando sei pronto.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/#percorsi"
                  className="btn-primary shadow-glow-green-sm"
                >
                  Scopri i percorsi
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {baseCourses.map((c) => {
          const ent = entitlements.courses[c.slug];
          const status = ent?.status ?? 'locked';
          const progress = ent?.progressPct ?? 0;
          const purchasedAt = ent?.purchasedAt ?? null;
          const isLocked = status === 'locked';
          const isPending = status === 'payment_pending';
          const isOwned =
            status === 'owned_not_started' ||
            status === 'owned_in_progress' ||
            status === 'owned_completed';
          const isCompleted = status === 'owned_completed';
          const inProgress = status === 'owned_in_progress';
          const notStarted = status === 'owned_not_started';

          let statusLabel = 'Bloccato';
          let statusClass = 'border-av-line text-av-muted bg-av-bg-2/60';
          let statusIcon: React.ReactNode = <Lock className="h-3.5 w-3.5" />;

          if (isPending) {
            statusLabel = 'Pagamento in corso';
            statusClass = 'border-av-yellow-deep/40 text-av-yellow bg-av-yellow/10';
            statusIcon = <Clock className="h-3.5 w-3.5" />;
          } else if (isCompleted) {
            statusLabel = 'Completato';
            statusClass = 'border-av-green-deep/50 text-av-green bg-av-green/10';
            statusIcon = <CheckCircle2 className="h-3.5 w-3.5" />;
          } else if (inProgress) {
            statusLabel = 'In corso';
            statusClass = 'border-av-green-deep/30 text-av-green bg-av-green/5';
            statusIcon = <BookOpenCheck className="h-3.5 w-3.5" />;
          } else if (notStarted) {
            statusLabel = 'Disponibile';
            statusClass = 'border-av-green-deep/30 text-av-green bg-av-green/5';
            statusIcon = <BookOpenCheck className="h-3.5 w-3.5" />;
          }

          const ownedHref =
            isOwned && ent?.latestLessonHref
              ? ent.latestLessonHref
              : isOwned
                ? '/area-membri/percorsi'
                : null;

          return (
            <GlassCard key={c.slug} className="overflow-hidden p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-2xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
                    <BookOpenCheck className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-white">
                        {c.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusClass}`}
                      >
                        {statusIcon}
                        {statusLabel}
                      </span>
                      {isOwned ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green/60 bg-av-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-av-green">
                          <CheckCircle2 className="h-3 w-3" />
                          Il corso è tuo
                        </span>
                      ) : null}
                    </div>
                    {c.subtitle ? (
                      <p className="mt-1 text-sm text-av-muted">{c.subtitle}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-av-muted">
                {c.description}
              </p>

              {!isLocked && !isPending ? (
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-av-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpenCheck className="h-3.5 w-3.5" />
                      Avanzamento
                    </span>
                    <span className="font-mono">{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-av-line bg-av-bg-2/80">
                    <div
                      className="h-full rounded-full bg-av-green transition-[width] duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}

              {isPending ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="mt-5 rounded-xl border border-av-yellow-deep/40 bg-av-yellow/5 px-4 py-3 text-sm text-av-yellow"
                >
                  <div className="flex items-start gap-2.5">
                    <Clock className="mt-0.5 h-4 w-4 flex-none animate-pulse" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">Stiamo confermando il pagamento</p>
                      <p className="mt-0.5 text-xs text-av-yellow/80">
                        La conferma richiede di solito meno di 30 secondi.
                      </p>
                      <PendingPaymentRefresher initialAnyPending />
                    </div>
                  </div>
                </div>
              ) : null}

              {purchasedAt ? (
                <div className="mt-4 flex items-center gap-2 text-xs text-av-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Data di acquisto:{' '}
                  <time dateTime={purchasedAt.toISOString()}>
                    {purchasedAt.toLocaleDateString('it-IT')}
                  </time>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2.5">
                {isLocked ? (
                  <Link
                    href="/#percorsi"
                    className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4 text-av-muted" />
                    Scopri i percorsi
                  </Link>
                ) : isPending ? (
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2 border-av-yellow-deep/40 text-av-yellow hover:bg-av-yellow/10"
                  >
                    <Clock className="h-4 w-4" />
                    Ricarica per aggiornare
                  </button>
                ) : isOwned && ownedHref ? (
                  <Link
                    href={ownedHref}
                    prefetch={false}
                    className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                  >
                    <BookOpenCheck className="h-4 w-4" />
                    {getOwnedCtaLabel(status)}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
