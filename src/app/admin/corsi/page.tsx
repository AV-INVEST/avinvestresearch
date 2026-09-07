import Link from 'next/link';
import { auth } from '@/auth';
import { isAdminSession } from '@/lib/auth/admin';
import { listAdminCourses, ensureAdminCoursesBootstrap } from '@/lib/admin/course-admin';
import GlassCard from '@/components/ui/GlassCard';
import {
  ArrowLeft,
  BookOpenCheck,
  CircleDot,
  FileCheck,
  FileX,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

function statusCounts(lessons: { status: string }[]) {
  const published = lessons.filter((l) => l.status === 'PUBLISHED').length;
  const drafts = lessons.length - published;
  return { published, drafts };
}

export default async function AdminCoursesIndexPage() {
  const session = await auth().catch(() => null);
  const isAdmin = session && isAdminSession(session as any);

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Torna alla Panoramica
        </Link>
        <GlassCard className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-white">
            Login richiesto
          </h1>
          <p className="mt-2 text-sm text-av-muted">
            Accedi con l&apos;account proprietario per gestire i contenuti.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Torna alla Panoramica
      </Link>
      <GlassCard className="border-red-500/30 bg-red-500/5 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-red-400" />
          <div>
            <h1 className="font-display text-2xl font-semibold text-white">
              Accesso negato
            </h1>
            <p className="mt-2 text-sm text-av-muted">
              Il tuo account non dispone delle autorizzazioni amministratore.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
    );
  }

  await ensureAdminCoursesBootstrap();
  const list = await listAdminCourses();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm font-medium text-av-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Torna alla Panoramica
          </Link>
          <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
            Gestione contenuti: corsi
          </h1>
          <p className="mt-2 text-sm text-av-muted sm:text-base">
            Modifica moduli e lezioni, pubblica bozze e riordina i contenuti.
          </p>
        </div>
      </div>

      {!list.ok ? (
        <GlassCard className="border-red-500/30 bg-red-500/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="font-semibold text-white">Errore caricamento corsi</p>
              <p className="mt-1 text-sm text-av-muted">{list.error}</p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {(list.courses || []).map((course) => {
          const totalLessons = course.modules.reduce(
            (sum, m) => sum + m.lessons.length,
            0,
          );
          const { published, drafts } = (() => {
            let p = 0;
            let d = 0;
            for (const m of course.modules) {
              for (const l of m.lessons) {
                if (l.status === 'PUBLISHED') p += 1;
                else d += 1;
              }
            }
            return { published: p, drafts: d };
          })();
          return (
            <GlassCard key={course.id} className="overflow-hidden p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="grid h-12 w-12 flex-none place-items-center rounded-2xl border border-av-green-deep/40 bg-av-green/10 text-av-green">
                    <BookOpenCheck className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {course.title}
                    </h3>
                    {course.subtitle ? (
                      <p className="mt-1 text-sm text-av-muted line-clamp-2">
                        {course.subtitle}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-av-line bg-av-bg-2/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                        <Layers className="h-3 w-3" />
                        {course.modules.length} moduli
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-green">
                        <CheckCircle2 className="h-3 w-3" />
                        {published} pubblicate
                      </span>
                      {drafts > 0 ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-av-yellow-deep/40 bg-av-yellow/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-av-yellow">
                          <CircleDot className="h-3 w-3" />
                          {drafts} bozze
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {course.modules.length === 0 ? (
                <div className="mt-4 rounded-xl border border-av-line bg-av-bg-2/50 px-4 py-3 text-sm text-av-muted">
                  Nessun modulo ancora. Crea il primo modulo per iniziare.
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link
                  href={`/admin/corsi/${course.slug}`}
                  className="btn-primary !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                >
                  Apri gestione
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/area-membri/corsi/${course.slug}`}
                  className="btn-ghost !py-2.5 !px-4 text-sm items-center justify-center gap-2"
                  prefetch={false}
                >
                  Anteprima pubblica
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
