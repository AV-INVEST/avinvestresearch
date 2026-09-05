import { Lock, Radar, Building2, AlertTriangle, Archive } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';

const icons = [Radar, Building2, AlertTriangle, Archive];

export default function ResearchClub() {
  return (
    <section
      id="research-club"
      className="relative py-24 sm:py-32 scroll-mt-28"
      aria-labelledby="rc-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.07),transparent_55%)]"
      />
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg-2/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-av-muted">
              <Lock className="h-3.5 w-3.5" />
              {siteConfig.researchClub.badge}
            </span>
            <h2 id="rc-heading" className="mt-5 heading-lg">
              {siteConfig.researchClub.title}
            </h2>
            <p className="mt-6 body-lg">{siteConfig.researchClub.description}</p>
            <p className="mt-5 text-sm text-av-muted sm:text-base">
              Contenuti ad approfondimento, materiale documentato e analisi strutturate.
              Nessun segnale di trading, nessuna promessa.
            </p>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-8 inline-flex items-center gap-2 rounded-xl border border-av-line bg-av-bg-2/70 px-5 py-3.5 text-sm font-semibold text-av-muted sm:text-base"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-av-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-av-green" />
              </span>
              IN ARRIVO - TI TERREMO AGGIORNATO
            </button>
          </div>

          <div className="lg:col-span-7">
            <GlassCard className="relative overflow-hidden p-5 sm:p-8">
              <div
                aria-hidden="true"
                className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-av-green/10 blur-3xl"
              />
              <div className="relative grid gap-4 sm:grid-cols-2">
                {siteConfig.researchClub.features.map((feature, i) => {
                  const Icon = icons[i] ?? Radar;
                  return (
                    <div
                      key={feature}
                      className="group rounded-2xl border border-av-line bg-av-bg-2/50 p-5 transition-all duration-300 hover:border-av-green-deep/60 hover:bg-av-surface"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green transition-all group-hover:shadow-glow-green-sm">
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-lg font-semibold text-white">
                          {feature}
                        </h3>
                      </div>
                      <div className="mt-4 h-px w-full bg-gradient-to-r from-av-green-deep/40 via-av-line to-transparent" />
                    </div>
                  );
                })}
              </div>
              <div className="relative mt-6 flex flex-wrap items-center gap-2 border-t border-av-line pt-6">
                <span className="text-xs font-medium text-av-muted sm:text-sm">
                  Materiali riservati ai membri:
                </span>
                <span className="chip">PDF</span>
                <span className="chip">Analisi</span>
                <span className="chip">Archivio</span>
                <span className="chip">Aggiornamenti</span>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}
