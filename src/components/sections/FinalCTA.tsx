import { ArrowRight, Phone, TrendingUp } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import MarketLine from '@/components/visuals/MarketLine';

export default function FinalCTA() {
  return (
    <section
      id="inizia"
      className="relative isolate overflow-hidden py-24 sm:py-32"
      aria-labelledby="final-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.10),transparent_55%)]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0">
        <MarketLine />
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 opacity-60 rotate-180">
        <MarketLine />
      </div>

      <div className="container-page relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <TrendingUp className="h-3.5 w-3.5" />
            La scelta è tua
          </span>
          <h2 id="final-heading" className="mt-5 heading-lg">
            Il mercato continuerà a muoversi.
            <br />
            <span className="text-gradient-green glow-text">
              La differenza è come scegli di affrontarlo.
            </span>
          </h2>
          <p className="mt-6 body-lg">
            Scegli se guardare i prezzi salire e scendere senza metodo, oppure costruire
            competenze, processo e criteri. Il resto è conseguenza.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href="#percorsi"
              className="btn-primary-lg inline-flex items-center justify-center gap-2 shadow-glow-green-sm"
            >
              ESPLORA I PERCORSI
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href={siteConfig.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-lg inline-flex items-center justify-center gap-2"
              aria-label="Prenota una Call Me (link esterno)"
            >
              <Phone className="h-5 w-5 text-av-green" />
              PRENOTA UNA CALL
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
