import { Phone, CalendarDays, Clock } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import NeonBeams from '@/components/visuals/NeonBeams';

export default function CallMe() {
  return (
    <section
      id="call-me"
      className="relative isolate overflow-hidden py-24 sm:py-32 scroll-mt-28"
      aria-labelledby="call-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-av-green/[0.04] to-transparent"
      />
      <NeonBeams />

      <div className="container-page relative">
        <GlassCard className="relative overflow-hidden border-av-green-deep/30 p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-av-green/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-av-green/10 blur-3xl"
          />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="eyebrow">
                <Phone className="h-3.5 w-3.5" />
                Call orientativa
              </span>
              <h2 id="call-heading" className="mt-5 heading-lg">
                Vuoi capire{' '}
                <span className="text-gradient-green glow-text">quale percorso fa per te?</span>
              </h2>
              <p className="mt-6 max-w-xl body-lg">
                Prenota una call orientativa con Andrea. Parleremo del tuo livello di
                partenza, dei tuoi obiettivi formativi e del percorso più adatto.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  { icon: CalendarDays, text: 'Scegli data e ora libere' },
                  { icon: Clock, text: 'Circa 20 minuti, senza impegno' },
                ].map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 rounded-xl border border-av-line bg-av-bg-2/60 px-4 py-3"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-av-green/10 text-av-green">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-white sm:text-base">{text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href={siteConfig.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary-lg inline-flex items-center justify-center gap-2 shadow-glow-green-lg"
                  aria-label="Prenota una call: scegli data e ora (link esterno)"
                >
                  <Phone className="h-5 w-5" />
                  PRENOTA UNA CALL
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-av-green-deep/30 bg-av-bg/70 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green shadow-glow-green-sm">
                    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
                      Importante
                    </p>
                    <p className="font-display text-lg font-semibold text-white">
                      Cosa è la call
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-av-muted sm:text-base">
                  Call orientativa. Non viene fornita consulenza finanziaria personalizzata.
                  Non parleremo di investimenti specifici, di strategie segrete o di
                  rendimenti garantiti: solo di formazione, metodo e percorso più adatto
                  alla tua situazione.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['No segnali', 'No consigli', 'Solo orientamento'].map((t) => (
                    <span key={t} className="chip">
                      <span className="h-1.5 w-1.5 rounded-full bg-av-green/70" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
