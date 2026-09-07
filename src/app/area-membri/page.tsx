import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { getEntitlements, getResearchClubEntitlement } from '@/lib/entitlements';
import GlassCard from '@/components/ui/GlassCard';
import ResearchClubCheckoutButton from '@/components/sections/ResearchClubCheckoutButton';
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
  Kanban,
  BookText,
  Crown,
  ShieldAlert,
  XCircle,
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
  const isAdmin = isAdminSession(session);
  const rcEntitlement = await getResearchClubEntitlement(session.user.id, session.user.email);

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

      {isAdmin ? (
        <GlassCard className="overflow-hidden border-av-green-deep/50 bg-av-green/[0.04] p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-green-deep/60 bg-av-green/15 text-av-green">
                  <Crown className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-white">
                    Gestione contenuti
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-av-muted sm:text-base">
                    Pannello proprietario — crea, modifica e pubblica lezioni e
                    documenti Research Club. I visitatori non amministratori non
                    vedono questi strumenti.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/corsi"
                className="btn-ghost border-av-green-deep/50 !py-2.5 !px-4 text-sm items-center justify-center gap-2 hover:bg-av-green/10"
              >
                <Kanban className="h-4 w-4 text-av-green" />
                Gestisci corsi
              </Link>
              <Link
                href="/admin/research"
                className="btn-ghost border-av-green-deep/50 !py-2.5 !px-4 text-sm items-center justify-center gap-2 hover:bg-av-green/10"
              >
                <BookText className="h-4 w-4 text-av-green" />
                Gestisci Research Club
              </Link>
              <Link
                href="/admin"
                className="btn-primary shadow-glow-green-sm whitespace-nowrap"
              >
                Apri dashboard admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <GlassCard
        className="overflow-hidden p-5 sm:p-6 border border-white/5"
        style={{
          backgroundImage:
            'radial-gradient(900px 300px at 0% -10%, rgba(201,169,97,0.06), transparent 60%)',
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-[#C9A961]/45 bg-[#C9A961]/10 text-[#C9A961]">
                <Crown className="h-5 w-5" />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9A961]">
                  Premium
                </p>
                <h2 className="font-display text-xl font-semibold text-white">
                  AV Research Club
                </h2>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base max-w-2xl">
              Analisi e ricerche di mercato riservate, con focus su aziende Small
              &amp; Mid Cap, scenari, catalizzatori e rischi. Archivio rolling
              degli ultimi 3 mesi.
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 lg:w-[320px] flex-none">
            {rcEntitlement.accessGranted ? (
              <div className={`rounded-2xl border p-4 ${
                rcEntitlement.status === 'cancel_at_period_end'
                  ? 'border-amber-500/40 bg-amber-500/[0.04]'
                  : rcEntitlement.status === 'payment_problem'
                    ? 'border-red-500/40 bg-red-500/[0.04]'
                    : 'border-av-green-deep/40 bg-av-green/[0.04]'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C9A961]">
                      19,90 € / mese
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {rcEntitlement.status === 'cancel_at_period_end' || rcEntitlement.status === 'ended'
                        ? 'Accesso attivo fino'
                        : 'Prossimo rinnovo'}
                      :{' '}
                      <span className="text-av-muted text-xs font-normal">
                        {rcEntitlement.nextDate
                          ? new Date(rcEntitlement.nextDate).toLocaleDateString('it-IT')
                          : '—'}
                      </span>
                    </p>
                  </div>
                  {rcEntitlement.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-av-green">
                      <CheckCircle2 className="h-3 w-3" /> ATTIVO
                    </span>
                  ) : rcEntitlement.status === 'cancel_at_period_end' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      RINNOVO DISATTIVATO
                    </span>
                  ) : rcEntitlement.status === 'payment_problem' ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300">
                      <ShieldAlert className="h-3 w-3" /> PAG. PROBLEMA
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href="/area-membri/research-club"
                    className="btn-primary !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 flex-1 shadow-glow-green-sm"
                  >
                    Archivio ricerche
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <form
                    action="/api/stripe/customer-portal"
                    method="POST"
                    className="flex-1"
                  >
                    <button
                      type="submit"
                      className="btn-ghost w-full !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5"
                    >
                      Gestisci abbonamento
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-av-line bg-av-bg-2/80 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-[#D4B46A]">
                    19,90
                  </span>
                  <span className="text-sm text-av-muted">€ / mese</span>
                </div>
                <p className="mt-1 text-[11px] text-av-muted/85">
                  Disdici quando vuoi. Accesso garantito fino a fine periodo.
                </p>
                <div className="mt-3">
                  <ResearchClubCheckoutButton
                    label="short"
                    returnTo="/area-membri"
                  />
                </div>
                <Link
                  href="/#research-club"
                  className="mt-2 btn-ghost w-full items-center justify-center gap-1.5 !py-2 text-[12px]"
                >
                  Dettagli prodotto
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
