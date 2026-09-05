import { Check, Clock, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import type { ComponentType } from 'react';

interface CourseMeta {
  badge: string;
  badgeIcon?: ComponentType<{ className?: string }>;
  highlight: boolean;
}

const meta: Record<'foundations' | 'tradingLab', CourseMeta> = {
  foundations: {
    badge: 'Percorso base',
    highlight: false,
  },
  tradingLab: {
    badge: 'Percorso avanzato',
    badgeIcon: Sparkles,
    highlight: true,
  },
};

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Courses() {
  const entries = (
    [
      ['foundations', siteConfig.courses.foundations],
      ['tradingLab', siteConfig.courses.tradingLab],
    ] as const
  ).map(([key, course]) => ({ key, course, m: meta[key] }));

  return (
    <section id="percorsi" className="relative py-24 sm:py-32" aria-labelledby="courses-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[560px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">Percorsi formativi</span>
            <h2 id="courses-heading" className="mt-5 heading-lg">
              Due percorsi, un solo principio:{' '}
              <span className="text-av-green">costruire competenze.</span>
            </h2>
          </div>
          <p className="max-w-md body-lg">
            Ogni corso è progettato per essere progressivo, pratico e privo di promesse irrealistiche.
            Nessun trucco, solo metodo.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {entries.map(({ key, course, m }) => {
            const BadgeIcon = m.badgeIcon;
            return (
              <GlassCard
                key={key}
                hover
                className={`relative flex h-full flex-col p-6 sm:p-8 ${
                m.highlight
                  ? 'lg:-translate-y-1 lg:shadow-glow-green-lg'
                  : ''
              }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg-2/70 px-3 py-1 text-xs font-medium text-av-muted">
                  {BadgeIcon ? <BadgeIcon className="h-3.5 w-3.5 text-av-green" /> : null}
                  {m.badge}
                </span>
                {m.highlight ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/60 bg-av-green/10 px-3 py-1 text-xs font-semibold text-av-green">
                    <Sparkles className="h-3 w-3" />
                    Consigliato
                  </span>
                ) : null}
              </div>

              <div className="mt-6">
                <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {course.title}
                </h3>
                <p className="mt-2 font-medium text-av-green">{course.subtitle}</p>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-av-muted sm:text-base">
                {course.description}
              </p>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-muted">
                  Cosa imparerai
                </p>
                <ul className="mt-4 grid gap-2.5">
                  {course.topics.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-white sm:text-base">
                      <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-av-green/10 text-av-green">
                        <Check className="h-3 w-3" />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex items-end justify-between border-t border-av-line pt-6">
                <div>
                  <p className="text-xs font-medium text-av-muted">Prezzo</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-white sm:text-4xl">
                    {formatPrice(course.price, course.currency)}
                    <span className="ml-2 text-sm font-medium text-av-muted">+ IVA</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-av-muted">
                  <Clock className="h-3.5 w-3.5" />
                  Accesso illimitato
                </span>
              </div>

              <button
                type="button"
                disabled
                aria-disabled="true"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-av-line bg-av-bg-2/70 px-5 py-3.5 text-sm font-semibold text-av-muted transition-colors sm:text-base"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-av-green opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-av-green" />
                </span>
                DISPONIBILE PROSSIMAMENTE
              </button>
            </GlassCard>
          );
        })}
        </div>
      </div>
    </section>
  );
}
