import Link from 'next/link';
import { ArrowRight, BookOpen, CirclePlay, Eye, GraduationCap } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

function formatPrice(value: number, currency: string, decimals = 0) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

const shortcuts = [
  {
    href: '/#trading-starter',
    icon: BookOpen,
    title: siteConfig.tradingStarter.title,
    meta: 'Guida PDF · entry-level',
    price: siteConfig.tradingStarter.price,
    currency: siteConfig.tradingStarter.currency,
    decimals: 2,
    accent: 'text-av-green border-av-green-deep/40 bg-av-green/10',
  },
  {
    href: '/#market-lens',
    icon: Eye,
    title: siteConfig.marketLens.title,
    meta: 'Indicatore one-time',
    price: siteConfig.marketLens.price,
    currency: siteConfig.marketLens.currency,
    decimals: 2,
    accent: 'text-av-green border-av-green-deep/40 bg-av-green/10',
  },
  {
    href: '/#percorsi',
    icon: GraduationCap,
    title: 'AV Complete Academy',
    meta: 'Foundations + Trading Lab',
    price: siteConfig.courseBundle.price,
    currency: siteConfig.courseBundle.currency,
    decimals: 0,
    accent: 'text-[#EBD9A8] border-[#C9A961]/45 bg-[#C9A961]/10',
  },
];

export default function OfferOverview() {
  return (
    <section
      id="offerta"
      className="relative py-14 sm:py-24 scroll-mt-28"
      aria-labelledby="offerta-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">
            <CirclePlay className="h-3.5 w-3.5" />
            Strumenti e formazione
          </span>
          <h2 id="offerta-heading" className="mt-5 heading-lg">
            Scegli da dove iniziare.{' '}
            <span className="text-av-green">Strumenti adatti al tuo livello.</span>
          </h2>
          <p className="mt-4 sm:mt-5 body-lg max-w-2xl mx-auto">
            Tre punti di partenza: la guida entry-level, l&apos;indicatore operativo
            e AV Academy, il percorso formativo completo. Nessun carrello, checkout
            diretto.
          </p>
        </div>

        <nav
          aria-label="Collegamenti alle sezioni prodotto"
          className="mt-8 sm:mt-10 grid gap-3 sm:grid-cols-3 max-w-4xl mx-auto"
        >
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group flex items-center gap-3 rounded-2xl border border-av-line bg-av-surface/50 px-4 py-3.5 transition-colors hover:border-av-green-deep/50 hover:bg-av-surface/80"
              >
                <span
                  className={`grid h-10 w-10 flex-none place-items-center rounded-xl border ${item.accent}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] uppercase tracking-wider text-av-muted">
                    {item.meta}
                  </span>
                </span>
                <span className="flex flex-none items-center gap-1.5">
                  <span className="font-display text-sm font-semibold text-white">
                    {formatPrice(item.price, item.currency, item.decimals)}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-av-muted transition-transform group-hover:translate-x-0.5 group-hover:text-av-green" />
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
