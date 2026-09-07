import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { normalizeEmail } from '@/lib/stripe/normalize';
import { getEntitlements } from '@/lib/entitlements';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Lock,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  Video,
  Clock,
  Layers,
} from 'lucide-react';
import {
  fetchFullCourseStructure,
  buildLessonHref,
  flattenFullLessons,
  fetchProgressSummary,
  type FullCourseStructure,
} from '@/lib/db/course-queries';
import type { ContentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const p = await params;
  return {
    title: 'Corso',
    description: `Percorso formativo ${p.courseSlug} in AV-INVEST Research.`,
  };
}

export default async function CourseHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { courseSlug } = await params;
  const sp = await searchParams;
  const isPreviewRequest = sp.preview === '1';

  const session = await auth().catch(() => null);
  if (!session?.user) {
    const path = `/area-membri/corsi/${encodeURIComponent(courseSlug)}`;
    redirect('/login?callbackUrl=' + encodeURIComponent(path));
  }

  const isAdmin = isAdminSession(session as any);

  const entitlements = await getEntitlements(session.user.id, session.user.email);
  const ent = entitlements.courses[courseSlug];
  const entStatus = ent?.status ?? 'locked';
  const owned =
    entStatus === 'owned_not_started' ||
    entStatus === 'owned_in_progress' ||
    entStatus === 'owned_completed';
  const allowPreview = isAdmin && isPreviewRequest;
  const allowAccess = owned || allowPreview;

  const includeDrafts = allowPreview;
  const structure: FullCourseStructure | null = await fetchFullCourseStructure(
    courseSlug,
    { includeDrafts },
  );
  if (!structure) notFound();

  const userEmail = normalizeEmail(session.user.email) || '';
  const flat = flattenFullLessons(structure, { includeDrafts });
  const totalLessons = flat.length;

  let progressPct = 0;
  let completedCount = 0;
  if (owned && totalLessons > 0 && userEmail) {
    const summary = await fetchProgressSummary(
      userEmail,
      (structure as unknown) as any,
    );
    progressPct = summary.progressPct;
    completedCount = summary.completedCount;
  }

  // Se owned e ha lezioni pubblicate: redirect alla prima o ultima lezione
  if (owned && !isPreviewRequest) {
    if (ent?.latestLessonHref) {
      redirect(ent.latestLessonHref);
    }
    if (flat.length > 0) {
      redirect(buildLessonHref(courseSlug, flat[0].moduleSlug, flat[0].lessonSlug));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/area-membri/percorsi"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna ai percorsi
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
          {structure.title}
        </h1>
        {structure.subtitle ? (
          <p className="mt-2 text-sm text-av-muted sm:text-base">{structure.subtitle}</p>
        ) : null}
      </div>

      {allowPreview ? (
        <GlassCard className="border-av-yellow-deep/30 bg-av-yellow/5 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-none text-av-yellow" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-av-yellow">
                Modalità anteprima amministratore
              </p>
              <p className="mt-1 text-xs leading-relaxed text-av-yellow/85">
                Stai visualizzando bozze e contenuti non pubblicati. Gli studenti
                vedono solo le lezioni con stato Pubblicata.
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                <Link
                  href={`/admin/corsi/${courseSlug}`}
                  className="btn-ghost !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5 border-av-yellow-deep/30 text-av-yellow hover:bg-av-yellow/10"
                >
                  Gestisci corso
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href={`/area-membri/corsi/${courseSlug}`}
                  className="btn-ghost !py-2 !px-3.5 text-[12px] items-center justify-center gap-1.5"
                >
                  Esci da anteprima
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!allowAccess ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <Lock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Percorso non ancora attivo
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                Per accedere alle lezioni, attiva il percorso corrispondente.
                Tutti i dettagli sono disponibili sulla pagina dei percorsi.
              </p>
              <div className="mt-4 flex flex-wrap gap-2.5">
                <Link
                  href="/#percorsi"
                  className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
                >
                  Scopri i percorsi
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/area-membri/percorsi"
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  <BookOpenCheck className="h-4 w-4 text-av-green" />
                  I miei percorsi
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      ) : totalLessons === 0 ? (
        <GlassCard className="overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-line bg-av-bg-2/80 text-av-muted">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Nessuna lezione disponibile
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted">
                {isAdmin
                  ? 'Le lezioni verranno mostrate qui non appena verranno pubblicate. Usa la sezione Admin per creare e pubblicare contenuti.'
                  : 'Le lezioni verranno pubblicate a breve. Torna più tardi o controlla la email per gli aggiornamenti.'}
              </p>
              {isAdmin ? (
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link
                    href={`/admin/corsi/${courseSlug}`}
                    className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2 shadow-glow-green-sm"
                  >
                    Vai a gestione corso
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </GlassCard>
      ) : (
        <>
          <GlassCard className="overflow-hidden p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                  Avanzamento
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-white">
                    {progressPct}%
                  </span>
                  <span className="text-xs text-av-muted">
                    {completedCount}/{totalLessons} completate
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full border border-av-line bg-av-bg-2/80">
                  <div
                    className="h-full rounded-full bg-av-green transition-[width] duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                  Moduli
                </p>
                <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-white">
                  <Layers className="h-5 w-5 text-av-green" />
                  {structure.modules.length}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-av-muted">
                  Lezioni
                </p>
                <p className="mt-2 flex items-center gap-2 font-display text-2xl font-semibold text-white">
                  <Video className="h-5 w-5 text-av-green" />
                  {totalLessons}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-5">
            {structure.modules.map((m, mIdx) => {
              const lessons = m.lessons.filter(
                (l) => includeDrafts || l.status === 'PUBLISHED',
              );
              if (lessons.length === 0) return null;
              let lRunning = 0;
              for (let i = 0; i < mIdx; i++) {
                const prev = structure.modules[i];
                lRunning += prev.lessons.filter(
                  (l) => includeDrafts || l.status === 'PUBLISHED',
                ).length;
              }
              return (
                <section key={m.id} className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-av-green-deep/40 bg-av-green/10 font-display text-sm font-bold text-av-green">
                      {mIdx + 1}
                    </span>
                    <h2 className="font-display text-lg font-semibold text-white sm:text-xl">
                      {m.title}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                      {lessons.length} lezioni
                    </span>
                  </div>
                  {m.description ? (
                    <p className="text-sm leading-relaxed text-av-muted">
                      {m.description}
                    </p>
                  ) : null}
                  <GlassCard className="overflow-hidden divide-y divide-av-line p-0">
                    {lessons.map((l, lIdx) => {
                      const globalNum = lRunning + lIdx + 1;
                      const href = buildLessonHref(structure.slug, m.slug, l.slug);
                      const isDraft = l.status !== 'PUBLISHED';
                      const duration = l.durationMin;
                      const hasVideo =
                        l.videoSourceType === 'YOUTUBE' ||
                        l.videoSourceType === 'BUNNY_STREAM';
                      return (
                        <Link
                          key={l.id}
                          href={href}
                          prefetch={false}
                          className="group flex items-stretch gap-4 px-4 py-3.5 transition-colors hover:bg-av-green/[0.04] sm:px-5 sm:py-4"
                        >
                          <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-surface/50 font-mono text-[12px] font-bold text-av-muted transition-colors group-hover:border-av-green-deep/50 group-hover:text-av-green">
                            {globalNum}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-white sm:text-base">
                                {l.title}
                              </h3>
                              {isDraft ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-yellow">
                                  <CircleDot className="h-2.5 w-2.5" />
                                  Bozza
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-av-green">
                                  <CheckCircle2 className="h-2.5 w-2.5" />
                                  Pubblicata
                                </span>
                              )}
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-av-muted">
                              {duration ? (
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {duration} min
                                </span>
                              ) : null}
                              {hasVideo ? (
                                <span className="inline-flex items-center gap-1">
                                  <Video className="h-3 w-3" />
                                  {l.videoSourceType === 'YOUTUBE'
                                    ? 'YouTube'
                                    : 'Bunny Stream'}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-av-muted/70">
                                  <Video className="h-3 w-3 opacity-60" />
                                  Nessun video
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="self-center text-av-muted transition-colors group-hover:text-av-green">
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </Link>
                      );
                    })}
                  </GlassCard>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
