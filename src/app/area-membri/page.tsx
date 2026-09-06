import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getEntitlements } from '@/lib/entitlements';
import GlassCard from '@/components/ui/GlassCard';
import {
  BookOpenCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Compass,
  Percent,
  CalendarDays,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Panoramica - Area membri',
  description: 'Panoramica personale dell\'area membri di AV-INVEST Research.',
  alternates: { canonical: '/area-membri' },
};

export default async function PanoramicaPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) {
    const target =
      '/login?callbackUrl=' + encodeURIComponent('/area-membri');
    redirect(target);
  }
  const name = session.user.name || 'Membro AV-INVEST';
  const entitlements = await getEntitlements(session.user.id, session.user.email);

  const courses = Object.values(entitlements.courses);
  const availableCourses = courses.filter((c) => c.status !== 'locked');
  const availableCount = availableCourses.length;
  const overallProgress =
    courses.length === 0
      ? 0
      : Math.round(
          courses.reduce((acc, c) => acc + (c.progressPct || 0), 0) /
            courses.length,
        );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-av-green">
            <Sparkles className="h-3.5 w-3.5" />
            Panoramica
          </p>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Ciao, {name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
            Da qui puoi gestire i tuoi percorsi, controllare i progressi e
            accedere al supporto dedicato.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3.5 py-1.5 text-xs font-semibold text-av-green">
          <ShieldCheck className="h-4 w-4" />
          Account attivo
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Percorsi disponibili
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {availableCount}
                <span className="ml-1 text-base text-av-muted">
                  / {courses.length}
                </span>
              </p>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              {availableCount === 0 ? (
                <Lock className="h-5 w-5" />
              ) : (
                <BookOpenCheck className="h-5 w-5 text-av-green" />
              )}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Progresso complessivo
              </p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">
                {overallProgress}%
              </p>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <Percent className="h-5 w-5 text-av-green" />
            </span>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full border border-av-line bg-av-bg-2/80">
            <div
              className="h-full rounded-full bg-av-green transition-[width] duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Ultima attivita
              </p>
              <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                Non disponibile
              </p>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <CalendarDays className="h-5 w-5" />
            </span>
          </div>
        </GlassCard>

        <GlassCard className="overflow-hidden p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-av-muted">
                Stato account
              </p>
              <p className="mt-2 text-sm font-semibold text-white sm:text-base">
                Sessione Google attiva
              </p>
            </div>
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
        </GlassCard>
      </div>

      {availableCount === 0 ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                  <Compass className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">
                    Non hai ancora acquistato alcun percorso
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-av-muted sm:text-base">
                    Quando avrai attivato un percorso, troverai qui i progressi, i
                    moduli e le lezioni a cui puoi accedere.
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/#percorsi"
              className="btn-primary shadow-glow-green-sm whitespace-nowrap"
            >
              Scopri i percorsi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">
                    Percorsi attivi: {availableCount}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-av-muted sm:text-base">
                    Hai accesso a:{' '}
                    {availableCourses
                      .map((c) => c.title)
                      .join(', ')}
                    . Vai ai percorsi per iniziare o continuare.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {availableCount < courses.length ? (
                <Link
                  href="/#percorsi"
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  Scopri tutti i percorsi
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                href="/area-membri/percorsi"
                className="btn-primary shadow-glow-green-sm whitespace-nowrap"
              >
                Apri i miei percorsi
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
