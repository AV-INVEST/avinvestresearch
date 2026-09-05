import { User } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';

export default function About() {
  return (
    <section id="chi-sono" className="relative py-24 sm:py-32 scroll-mt-28" aria-labelledby="about-heading">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GlassCard className="overflow-hidden p-2 sm:p-3">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-av-bg-2">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.18),transparent_60%)]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-grid-trading bg-grid-trading opacity-40"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative flex flex-col items-center">
                    <div className="grid h-28 w-28 place-items-center rounded-full border border-av-green-deep/60 bg-av-bg-2 shadow-glow-green sm:h-36 sm:w-36">
                      <User className="h-14 w-14 text-av-green sm:h-18 sm:w-18" />
                    </div>
                    <div className="mt-5 rounded-full border border-av-green-deep/50 bg-av-green/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-av-green">
                      {siteConfig.founder.name}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-av-line bg-av-bg/80 px-4 py-3 backdrop-blur">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-av-green animate-pulse" />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-av-muted">
                      Founder · AV‑INVEST Research
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-7 lg:pl-6">
            <span className="eyebrow">Chi è Andrea</span>
            <h2 id="about-heading" className="mt-5 heading-lg">
              Dietro AV‑INVEST:{' '}
              <span className="text-av-green">un progetto, non un personaggio.</span>
            </h2>
            <div className="mt-6 space-y-5 body-lg">
              <p>{siteConfig.founder.bio}</p>
              <p>
                L&apos;approccio è semplice: documentazione, regole chiare e costanza.
                Niente scorciatoie, niente promesse di rendimenti facili. Solo una struttura
                per capire i mercati, valutare i rischi e scegliere con criterio.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { k: 'Approccio', v: 'Strutturato' },
                { k: 'Focus', v: 'Analisi & Rischio' },
                { k: 'Formato', v: 'Pratico & Operativo' },
              ].map((it) => (
                <div
                  key={it.k}
                  className="rounded-2xl border border-av-line bg-av-surface/60 p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
                    {it.k}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold text-white">
                    {it.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
