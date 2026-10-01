import { TrendingUp } from 'lucide-react';
import MarketLine from '@/components/visuals/MarketLine';

export default function FinalCTA() {
  return (
    <section
      id="inizia"
      className="relative isolate overflow-hidden py-14 sm:py-32 scroll-mt-28"
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
          <p className="mt-4 sm:mt-6 body-lg">
            Scegli se guardare i prezzi salire e scendere senza metodo, oppure costruire
            competenze, processo e criteri. Il resto è conseguenza.
          </p>
        </div>
      </div>
    </section>
  );
}
