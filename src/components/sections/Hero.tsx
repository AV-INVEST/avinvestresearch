import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GridBackground from '@/components/visuals/GridBackground';
import NeonBeams from '@/components/visuals/NeonBeams';
import HeroChartSVG from '@/components/visuals/HeroChartSVG';

const pillars = ['Metodo', 'Dati', 'Disciplina'];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden pt-24 sm:pt-28 lg:pt-32 scroll-mt-28"
      aria-labelledby="hero-heading"
    >
      <GridBackground />
      <NeonBeams />

      <div className="container-page relative">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="animate-fade-in-up">
              <span className="eyebrow">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-av-green opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-av-green" />
                </span>
                Formazione finanziaria strutturata
              </span>
            </div>

            <h1
              id="hero-heading"
              className="mt-6 heading-xl animate-fade-in-up [animation-delay:120ms]"
            >
              Non seguire il mercato.
              <br />
              <span className="text-gradient-green glow-text">Impara a leggerlo.</span>
            </h1>

            <p
              className="mt-6 max-w-2xl body-lg animate-fade-in-up [animation-delay:240ms]"
            >
              Formazione finanziaria, analisi tecnica e metodo operativo per prendere
              decisioni più consapevoli. Nessun segnale. Nessuna promessa. Solo
              competenze.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 animate-fade-in-up [animation-delay:360ms] sm:flex-row sm:flex-wrap"
            >
              <Link
                href="/#percorsi"
                className="btn-ghost-lg inline-flex items-center justify-center gap-2"
              >
                SCOPRI I PERCORSI
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={siteConfig.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-lg shadow-glow-green inline-flex items-center justify-center gap-2"
                aria-label="Prenota una call orientativa (link esterno, si apre in nuova scheda)"
              >
                <Phone className="h-5 w-5" />
                PRENOTA UNA CALL
              </a>
            </div>

            <div
              className="mt-10 flex flex-wrap items-center gap-2 animate-fade-in-up [animation-delay:500ms]"
            >
              {pillars.map((p) => (
                <span key={p} className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-av-green" />
                  {p}
                </span>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[560px] animate-fade-in [animation-delay:400ms]">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-av-green/20 via-transparent to-av-green/10 opacity-70 blur-2xl" />
              <div className="relative glass-card overflow-hidden p-3 sm:p-4">
                <div className="flex items-center justify-between rounded-xl border border-av-line bg-av-bg-2/70 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-av-green shadow-glow-green-sm" />
                    <span className="font-mono text-[11px] uppercase tracking-widest text-av-muted sm:text-xs">
                      AV · MARKET VIEW
                    </span>
                  </div>
                  <div className="hidden items-center gap-1 text-[10px] font-mono text-av-muted sm:flex">
                    <span className="text-av-green">●</span> LIVE
                  </div>
                </div>
                <div className="mt-3 aspect-[16/10] w-full">
                  <HeroChartSVG />
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono">
                  {[
                    { k: 'TREND', v: 'Rialzista', c: 'text-av-green' },
                    { k: 'CONTESTO', v: 'Neutro', c: 'text-white' },
                    { k: 'VOLATILITÀ', v: 'Media', c: 'text-av-muted' },
                  ].map((it) => (
                    <div
                      key={it.k}
                      className="rounded-lg border border-av-line bg-av-bg-2/50 px-3 py-2"
                    >
                      <div className="text-[10px] uppercase tracking-widest text-av-muted/80">
                        {it.k}
                      </div>
                      <div className={`mt-1 text-xs font-semibold ${it.c}`}>{it.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
