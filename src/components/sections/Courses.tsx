import Link from 'next/link';
import { Check, Sparkles, ArrowRight, BookOpen, Shield, Zap } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import CourseCheckoutButton from '@/components/sections/CourseCheckoutButton';
import type { CourseEntitlement, EntitlementsState, CourseStatus } from '@/lib/entitlements';

function formatPrice(value: number, currency: string, decimals = 0) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

function getOwnedCtaLabel(status: CourseStatus): string {
  switch (status) {
    case 'owned_not_started':
      return 'Inizia il corso';
    case 'owned_in_progress':
      return 'Riprendi la lezione';
    case 'owned_completed':
      return 'Rivedi il corso';
    default:
      return 'Apri il corso';
  }
}

const OWNED_STATUSES: CourseStatus[] = [
  'owned_not_started',
  'owned_in_progress',
  'owned_completed',
];

type CourseSlug = 'foundations' | 'trading-lab';

const CARD_BENEFITS: Record<CourseSlug, string[]> = {
  foundations: [
    'Struttura di mercato, trend e livelli chiave',
    'Volumi, indicatori e contesto',
    'Gestione del rischio e metodo operativo',
  ],
  'trading-lab': [
    'Analisi multi-timeframe e qualita del setup',
    'Conferme e invalidazione',
    'Position sizing e gestione dell\u2019operazione',
  ],
};

interface CardConfig {
  slug: CourseSlug;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  currency: string;
  featured: boolean;
}

const publicCourses = (Object.entries(siteConfig.courses) as unknown as Array<
  [keyof typeof siteConfig.courses, (typeof siteConfig.courses)[keyof typeof siteConfig.courses]]
>).filter(([, c]) => (c as { publicVisible?: boolean }).publicVisible === true);

export default function Courses({ entitlements }: { entitlements?: EntitlementsState }) {
  const bundle = siteConfig.courseBundle;

  const cards: CardConfig[] = [
    {
      slug: 'foundations',
      badge: siteConfig.courses.foundations.level ?? 'BASE / INTERMEDIO',
      title: siteConfig.courses.foundations.title,
      subtitle: siteConfig.courses.foundations.subtitle,
      description:
        'Il punto di partenza: grafici, trend, livelli, volumi e gestione del rischio con un metodo chiaro e progressivo.',
      price: siteConfig.courses.foundations.price,
      currency: siteConfig.courses.foundations.currency,
      featured: false,
    },
    {
      slug: 'trading-lab',
      badge: siteConfig.courses.tradingLab.level ?? 'AVANZATO',
      title: siteConfig.courses.tradingLab.title,
      subtitle: siteConfig.courses.tradingLab.subtitle,
      description:
        'Il percorso operativo: contesto, conferme, invalidazione e dimensionamento per chi vuole un metodo avanzato e disciplinato.',
      price: siteConfig.courses.tradingLab.price,
      currency: siteConfig.courses.tradingLab.currency,
      featured: true,
    },
  ];

  const entFor = (slug: CourseSlug): CourseEntitlement | undefined =>
    entitlements?.courses[slug];
  const isOwned = (ent?: CourseEntitlement) =>
    ent?.status === undefined ? false : OWNED_STATUSES.includes(ent.status);
  const isPending = (ent?: CourseEntitlement) => ent?.status === 'payment_pending';

  const ownsFoundations = isOwned(entFor('foundations'));
  const ownsTradingLab = isOwned(entFor('trading-lab'));
  const bundleBlocked = ownsFoundations || ownsTradingLab;

  return (
    <section
      id="percorsi"
      className="relative py-14 sm:py-32 scroll-mt-28"
      aria-labelledby="courses-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[560px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Videocorsi
            </span>
            <h2 id="courses-heading" className="mt-5 heading-lg">
              Due percorsi, una direzione.
              <br />
              <span className="text-av-green">
                Dal metodo base all&apos;operatività avanzata.
              </span>
            </h2>
          </div>
          <p className="max-w-md body-lg">
            Acquista un solo videocorso o entrambi con il bundle AV Complete
            Academy. Pagamento unico, accesso illimitato nell&apos;area membri.
          </p>
        </div>

        <div className="mt-9 sm:mt-14 grid gap-5 sm:gap-6 lg:grid-cols-2 w-full min-w-0 max-w-full">
          {cards.map((card) => {
            const ent = entFor(card.slug);
            const owned = isOwned(ent);
            const pending = isPending(ent);
            const progressPct = ent?.progressPct ?? 0;
            const ownedHref =
              owned && ent?.latestLessonHref
                ? ent.latestLessonHref
                : owned
                  ? '/area-membri/percorsi'
                  : null;

            return (
              <GlassCard
                key={card.slug}
                hover
                className={[
                  'relative flex h-full flex-col p-6 sm:p-7 w-full min-w-0 max-w-full',
                  card.featured
                    ? 'border-av-green/40 shadow-[0_0_0_1px_rgba(0,255,106,0.12),0_8px_44px_-12px_rgba(0,255,106,0.36)] hover:border-av-green/70 hover:shadow-glow-green'
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {card.featured ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.16),transparent_70%)]"
                  />
                ) : null}

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={[
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]',
                      card.featured
                        ? 'border-av-green/50 bg-av-green/10 text-av-green'
                        : 'border-av-line bg-av-bg-2/70 text-av-muted',
                    ].join(' ')}
                  >
                    {card.featured ? <Zap className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                    {card.badge}
                  </span>
                  {owned ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green/60 bg-av-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-av-green shadow-glow-green-sm">
                      <Check className="h-3 w-3" />
                      Il corso è tuo
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 min-w-0">
                  <h3 className="font-display text-2xl font-semibold leading-tight text-white break-words">
                    {card.title}
                  </h3>
                  <p className="mt-1.5 font-medium text-av-green">{card.subtitle}</p>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-av-muted min-w-0 max-w-full break-words">
                  {card.description}
                </p>

                <ul className="mt-5 space-y-2.5">
                  {CARD_BENEFITS[card.slug].map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3 min-w-0">
                      <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-av-green/10 text-av-green">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="text-sm leading-snug text-white/90 break-words">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  <div className="flex items-baseline gap-2 min-w-0">
                    {owned ? (
                      <span className="text-sm font-semibold text-av-green">
                        Già in tuo possesso
                      </span>
                    ) : (
                      <>
                        <span className="font-display text-3xl font-semibold text-white">
                          {formatPrice(card.price, card.currency)}
                        </span>
                        <span className="text-xs font-medium text-av-muted">
                          una tantum · IVA inclusa
                        </span>
                      </>
                    )}
                  </div>

                  {owned && ent ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-av-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-av-green" />
                          Avanzamento
                        </span>
                        <span className="font-mono text-white/80">{progressPct}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full border border-av-line bg-av-bg-2/80">
                        <div
                          className="h-full rounded-full bg-av-green transition-[width] duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {owned && ownedHref ? (
                    <Link
                      href={ownedHref}
                      prefetch={false}
                      className="btn-primary mt-4 items-center justify-center gap-2 w-full min-w-0 max-w-full"
                    >
                      {getOwnedCtaLabel(ent?.status as CourseStatus)}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <CourseCheckoutButton slug={card.slug} />
                  )}
                  {pending ? (
                    <p className="mt-2 text-xs text-av-yellow">
                      Pagamento in corso: riprendi per completare l&apos;accesso.
                    </p>
                  ) : null}
                </div>
              </GlassCard>
            );
          })}
        </div>

        <GlassCard
          hover
          className="mt-5 sm:mt-6 relative overflow-hidden p-6 sm:p-7 w-full min-w-0 max-w-full border-av-green-deep/40"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-72 bg-[radial-gradient(ellipse_at_right,rgba(0,255,106,0.12),transparent_70%)]"
          />
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green/50 bg-av-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-av-green">
                <Sparkles className="h-3.5 w-3.5" />
                Bundle
              </span>
              <h3 className="mt-3 font-display text-xl font-semibold text-white sm:text-2xl break-words">
                {bundle.title}
              </h3>
              <p className="mt-1.5 text-sm text-av-muted break-words">
                Include <span className="text-white/90">{siteConfig.courses.foundations.title}</span> e{' '}
                <span className="text-white/90">{siteConfig.courses.tradingLab.title}</span>. Due percorsi, progressi separati.
              </p>
              <p className="mt-2 inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-av-green">
                Risparmi {formatPrice(bundle.savings, bundle.currency)}
                <span className="font-normal text-av-muted">
                  (invece di {formatPrice(bundle.compareAtPrice, bundle.currency)})
                </span>
              </p>
            </div>

            <div className="sm:min-w-[240px]">
              {bundleBlocked ? (
                <div className="rounded-xl border border-av-line bg-av-bg-2/50 p-4">
                  <p className="text-sm font-semibold text-white/90">
                    Bundle non disponibile
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-av-muted">
                    Possiedi già uno dei corsi inclusi: puoi acquistare l&apos;altro
                    singolarmente a prezzo pieno. Nessuno sconto retroattivo.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-semibold text-white">
                      {formatPrice(bundle.price, bundle.currency)}
                    </span>
                    <span className="text-xs font-medium text-av-muted line-through">
                      {formatPrice(bundle.compareAtPrice, bundle.currency)}
                    </span>
                  </div>
                  <CourseCheckoutButton slug="complete-academy" />
                  <p className="mt-2 flex items-center gap-1.5 text-[11px] text-av-muted">
                    <Shield className="h-3.5 w-3.5 text-av-green" />
                    Pagamento sicuro · IVA inclusa
                  </p>
                </>
              )}
            </div>
          </div>
        </GlassCard>
      </div>

      {publicCourses.map(([key, c]) => (
        <script
          key={key}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Course',
              name: c.title,
              description: c.description,
              provider: {
                '@type': 'Organization',
                name: siteConfig.name,
                url: siteConfig.url,
              },
              offers: {
                '@type': 'Offer',
                price: c.price,
                priceCurrency: c.currency,
                availability: c.available
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/PreOrder',
                url: `${siteConfig.url}/#percorsi`,
              },
            }),
          }}
        />
      ))}
    </section>
  );
}
