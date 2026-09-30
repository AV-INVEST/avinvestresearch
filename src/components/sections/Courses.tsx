import Link from 'next/link';
import { Check, Sparkles, Clock, ArrowRight, Infinity, BookOpen, CreditCard, Shield } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import GlassCard from '@/components/ui/GlassCard';
import CourseCheckoutButton from '@/components/sections/CourseCheckoutButton';
import type { ComponentType } from 'react';
import type { CourseEntitlement, EntitlementsState, CourseStatus } from '@/lib/entitlements';

function formatPrice(value: number, currency: string) {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
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

const publicCourses = (Object.entries(siteConfig.courses) as unknown as Array<
  [keyof typeof siteConfig.courses, (typeof siteConfig.courses)[keyof typeof siteConfig.courses]]
>).filter(([, c]) => (c as { publicVisible?: boolean }).publicVisible === true);

export default function Courses({ entitlements }: { entitlements?: EntitlementsState }) {
  const course = siteConfig.courses.foundations;
  const ent: CourseEntitlement | undefined = entitlements?.courses[course.slug];
  const status = ent?.status;
  const isOwned =
    status === 'owned_not_started' ||
    status === 'owned_in_progress' ||
    status === 'owned_completed';
  const isPending = status === 'payment_pending';
  const isLocked = !entitlements ? false : status === 'locked' || status === undefined;
  const ownedHref =
    isOwned && ent?.latestLessonHref
      ? ent.latestLessonHref
      : isOwned
        ? '/area-membri/percorsi'
        : null;
  const progressPct = ent?.progressPct ?? 0;

  const highlights = [
    { icon: Clock, label: course.durationLabel ?? 'Durata stimata', text: 'di formazione video' },
    { icon: Infinity, label: 'Accesso illimitato', text: 'senza scadenza' },
    { icon: CreditCard, label: 'Pagamento unico', text: 'nessun abbonamento' },
    { icon: BookOpen, label: 'Area membri', text: 'progresso salvato' },
  ];

  return (
    <section id="percorsi" className="relative py-14 sm:py-32 scroll-mt-28" aria-labelledby="courses-heading">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[560px] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.08),transparent_60%)]"
      />
      <div className="container-page">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <Sparkles className="h-3.5 w-3.5" />
              Videocorso completo
            </span>
            <h2 id="courses-heading" className="mt-5 heading-lg">
              {course.title}
              <br />
              <span className="text-av-green">Analisi tecnica da zero, con un metodo strutturato.</span>
            </h2>
          </div>
          <p className="max-w-md body-lg">
            {course.description}
          </p>
        </div>

        <div className="mt-9 sm:mt-14 grid gap-5 sm:gap-6 lg:grid-cols-12 w-full min-w-0 max-w-full">
          <div className="lg:col-span-7 w-full min-w-0 max-w-full flex flex-col gap-5 sm:gap-6">
            <GlassCard hover className="relative flex h-full flex-col p-6 sm:p-8 w-full min-w-0 max-w-full">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-av-line bg-av-bg-2/70 px-3 py-1 text-xs font-medium text-av-muted">
                  <BookOpen className="h-3.5 w-3.5 text-av-green" />
                  Corso principale
                </span>
                {isOwned ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green/60 bg-av-green/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-av-green shadow-glow-green-sm">
                    <Check className="h-3 w-3" />
                    Il corso è tuo
                  </span>
                ) : null}
              </div>

              <div className="mt-6 min-w-0">
                <h3 className="font-display text-2xl font-semibold leading-tight text-white sm:text-3xl break-words">
                  {course.title}
                </h3>
                <p className="mt-2 font-medium text-av-green">{course.subtitle}</p>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-av-muted sm:text-base min-w-0 max-w-full break-words">
                {course.description}
              </p>

              <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
                {highlights.map((h) => {
                  const HIcon = h.icon;
                  return (
                    <div
                      key={h.label}
                      className="rounded-xl border border-av-line bg-av-bg-2/50 p-3.5 sm:p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-av-green/10 text-av-green">
                          <HIcon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-white break-words">
                            {h.label}
                          </p>
                          <p className="mt-0.5 text-[11px] sm:text-xs text-av-muted break-words">
                            {h.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-muted">
                  Cosa imparerai
                </p>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {course.topics.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-sm text-white sm:text-base min-w-0">
                      <span className="mt-1 grid h-5 w-5 flex-none place-items-center rounded-full bg-av-green/10 text-av-green">
                        <Check className="h-3 w-3" />
                      </span>
                      <span className="break-words">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5 w-full min-w-0 max-w-full">
            <GlassCard hover className="relative flex h-full flex-col p-6 sm:p-8 w-full min-w-0 max-w-full lg:sticky lg:top-28">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1 text-xs font-semibold text-av-green">
                  <Sparkles className="h-3.5 w-3.5" />
                  Corso completo
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-av-muted">
                  <Shield className="h-3.5 w-3.5 text-av-green" />
                  Pagamento sicuro
                </span>
              </div>

              <div className="mt-6 min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-av-muted">
                  Investimento una tantum
                </p>
                <div className="mt-2 flex items-baseline gap-2 min-w-0 flex-wrap">
                  <p className="font-display text-4xl sm:text-5xl font-semibold text-white break-words">
                    {formatPrice(course.price, course.currency)}
                  </p>
                </div>
                <p className="mt-2 text-xs font-medium text-av-green">
                  Pagamento unico · IVA inclusa
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-av-line bg-av-bg-2/50 p-4">
                <ul className="space-y-2.5">
                  <li className="flex items-start gap-2.5 text-sm text-white/90 min-w-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="break-words">{course.durationLabel} di formazione strutturata</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/90 min-w-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="break-words">Accesso illimitato, senza scadenza</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/90 min-w-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="break-words">Area membri con progresso salvato</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/90 min-w-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="break-words">Fruibile da smartphone, tablet e desktop</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-sm text-white/90 min-w-0">
                    <Check className="mt-0.5 h-4 w-4 flex-none text-av-green" />
                    <span className="break-words">Adatto anche a chi parte da zero</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 space-y-3 border-t border-av-line pt-6">
                {!isOwned ? null : (
                  <div className="space-y-2">
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
                )}
              </div>

              {entitlements === undefined || isLocked ? (
                <CourseCheckoutButton slug={course.slug} />
              ) : isPending ? (
                <CourseCheckoutButton slug={course.slug} />
              ) : isOwned && ownedHref ? (
                <Link
                  href={ownedHref}
                  prefetch={false}
                  className="btn-primary mt-6 items-center justify-center gap-2 w-full min-w-0 max-w-full"
                >
                  {getOwnedCtaLabel(status as CourseStatus)}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <CourseCheckoutButton slug={course.slug} />
              )}
            </GlassCard>
          </div>
        </div>
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
