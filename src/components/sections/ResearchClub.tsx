import Link from 'next/link';
import { Radar, Building2, AlertTriangle, Archive, Crown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { auth } from '@/auth';
import { getResearchClubEntitlement } from '@/lib/entitlements';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import ResearchClubCheckoutButton from '@/components/sections/ResearchClubCheckoutButton';

const icons = [Radar, Building2, AlertTriangle, Archive];

const GOLD = {
  text: 'text-[#C9A961]',
  heading: 'text-[#D4B46A]',
  border: 'border-[#C9A961]/40',
  borderStrong: 'border-[#C9A961]/65',
  bg: 'bg-[#C9A961]/10',
  bgSoft: 'bg-[#C9A961]/[0.06]',
} as const;

export default async function ResearchClub() {
  const session = await auth().catch(() => null);
  let rcEntitlement = null as Awaited<ReturnType<typeof getResearchClubEntitlement>> | null;
  if (session?.user?.email) {
    try {
      rcEntitlement = await getResearchClubEntitlement(session.user.id, session.user.email);
    } catch {
      rcEntitlement = null;
    }
  }

  const rc = siteConfig.researchClub;
  const subscribed = rcEntitlement?.accessGranted === true;

  return (
    <section
      id="research-club"
      className="relative py-24 sm:py-32 scroll-mt-28"
      aria-labelledby="rc-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(201,169,97,0.08),transparent_58%),radial-gradient(ellipse_at_bottom_right,rgba(0,255,106,0.05),transparent_55%)]"
      />
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span
              className={`inline-flex items-center gap-2 rounded-full border ${GOLD.border} ${GOLD.bgSoft} px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${GOLD.text}`}
            >
              <Crown className={`h-3.5 w-3.5 ${GOLD.text}`} />
              {rc.badge}
            </span>
            <h2 id="rc-heading" className="mt-5 heading-lg">
              {rc.title}
            </h2>
            <p className="mt-5 body-lg">
              {rc.tagline}
            </p>
            <p className="mt-5 text-sm text-av-muted sm:text-base">
              {rc.description}
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className={`font-display text-5xl font-semibold ${GOLD.heading}`}>
                  19,90
                </span>
                <span className="text-base text-av-muted">€ / mese</span>
              </div>
              <p className="text-xs leading-relaxed text-av-muted/90 max-w-md">
                {rc.notes?.[0]}
              </p>

              {subscribed ? (
                <div className="flex flex-wrap items-center gap-3 pt-1 w-full max-w-md">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-av-green">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Sei dentro
                  </span>
                  <Link
                    href="/area-membri/research-club"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-[#C9A961]/70 bg-[#0a0906] !py-3 !px-5 text-sm font-semibold text-white transition-all duration-200 ease-out hover:border-[#D4B46A] hover:shadow-glow-gold-sm focus-visible:outline-[#C9A961] sm:text-base"
                    style={{
                      backgroundImage:
                        'linear-gradient(180deg, rgba(201,169,97,0.12), rgba(201,169,97,0.02))',
                    }}
                  >
                    Vai all&apos;archivio ricerche
                    <ArrowRight className="h-4 w-4 text-[#C9A961]" />
                  </Link>
                </div>
              ) : (
                <div className="w-full max-w-md pt-1">
                  <ResearchClubCheckoutButton
                    label="full"
                    returnTo="/#research-club"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            <GlassCard
              className="relative overflow-hidden p-5 sm:p-8 border border-white/5"
              style={{
                backgroundImage:
                  'radial-gradient(1200px 500px at 100% 0%, rgba(201,169,97,0.06), transparent 60%)',
              }}
            >
              <div
                aria-hidden="true"
                className={`absolute -right-24 -top-24 h-64 w-64 rounded-full ${GOLD.bgSoft} blur-3xl`}
              />
              <div className="relative grid gap-4 sm:grid-cols-2">
                {rc.features.map((feature, i) => {
                  const Icon = icons[i] ?? Radar;
                  const isGold = i === 0 || i === 3;
                  return (
                    <div
                      key={feature}
                      className={`group rounded-2xl border ${
                        isGold
                          ? `${GOLD.border} ${GOLD.bgSoft}`
                          : 'border-av-line bg-av-bg-2/50'
                      } p-5 transition-all duration-300 hover:border-white/20 hover:bg-av-surface`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-xl border transition-all ${
                            isGold
                              ? `${GOLD.border} ${GOLD.bg} ${GOLD.text} group-hover:shadow-[0_0_24px_-6px_rgba(201,169,97,0.5)]`
                              : 'border-av-green-deep/50 bg-av-green/10 text-av-green group-hover:shadow-glow-green-sm'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3
                          className={`font-display text-lg font-semibold ${
                            isGold ? GOLD.heading : 'text-white'
                          }`}
                        >
                          {feature}
                        </h3>
                      </div>
                      <div
                        className={`mt-4 h-px w-full bg-gradient-to-r ${
                          isGold
                            ? 'from-[#C9A961]/40 via-av-line to-transparent'
                            : 'from-av-green-deep/40 via-av-line to-transparent'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-av-line pt-6">
                <span className="text-xs font-medium text-av-muted sm:text-sm">
                  Materiali riservati ai membri:
                </span>
                <span className={`chip border ${GOLD.border} ${GOLD.bgSoft} ${GOLD.text}`}>
                  PDF
                </span>
                <span className="chip">Analisi</span>
                <span className="chip">Archivio 12</span>
                <span className="chip">Aggiornamenti</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
