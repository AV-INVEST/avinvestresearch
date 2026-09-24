import Image from 'next/image';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';

export default function About() {
  return (
    <section id="chi-sono" className="relative py-14 sm:py-32 scroll-mt-28" aria-labelledby="about-heading">
      <div className="container-page">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <GlassCard className="overflow-hidden p-2 sm:p-3">
              <div className="relative aspect-[16/10] sm:aspect-[4/5] w-full overflow-hidden rounded-xl bg-av-bg-2 transition-transform duration-500 hover:scale-[1.02] opacity-0 animate-fade-in-up [animation-delay:150ms]">
                <div className="absolute inset-0">
                  <Image
                    src="/images/andrea-founder.webp"
                    alt="Andrea Vivace, fondatore di AV-INVEST Research"
                    fill
                    sizes="(max-width: 1023px) 100vw, 380px"
                    className="object-cover object-[50%_15%]"
                  />
                </div>
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-av-line bg-av-bg/80 px-4 py-2.5 sm:py-3 backdrop-blur">
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
            <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-5 body-lg">
              <p>{siteConfig.founder.bio}</p>
              <p>
                L&apos;approccio è semplice: documentazione, regole chiare e costanza.
                Niente scorciatoie, niente promesse di rendimenti facili. Solo una struttura
                per capire i mercati, valutare i rischi e scegliere con criterio.
              </p>
            </div>
            <div className="mt-7 sm:mt-10 grid gap-3 sm:gap-4 sm:grid-cols-3">
              {[
                { k: 'Approccio', v: 'Strutturato' },
                { k: 'Focus', v: 'Analisi & Rischio' },
                { k: 'Formato', v: 'Pratico & Operativo' },
              ].map((it) => (
                <div
                  key={it.k}
                  className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
                    {it.k}
                  </p>
                  <p className="mt-1.5 sm:mt-2 font-display text-base sm:text-lg font-semibold text-white">
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
