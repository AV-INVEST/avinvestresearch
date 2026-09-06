import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth, signOut } from '@/auth';
import {
  ArrowUpRight,
  Home,
  LayoutDashboard,
  BookOpenCheck,
  UserCircle,
  LifeBuoy,
  LogOut,
  UserRound,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function logoutAction() {
  'use server';
  await signOut({ redirectTo: '/' });
}

interface NavItem {
  href: string;
  label: string;
  Icon: typeof Home;
}

const NAV: NavItem[] = [
  { href: '/area-membri', label: 'Panoramica', Icon: LayoutDashboard },
  { href: '/area-membri/percorsi', label: 'I miei percorsi', Icon: BookOpenCheck },
  { href: '/area-membri/profilo', label: 'Profilo e sicurezza', Icon: UserCircle },
  { href: '/area-membri/assistenza', label: 'Assistenza', Icon: LifeBuoy },
];

export default async function MemberAreaLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth().catch(() => null);
  const name = session?.user?.name || 'Membro AV-INVEST';
  const email = session?.user?.email || '';
  const image = session?.user?.image;

  return (
    <div className="relative min-h-screen pt-24 pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(0,255,106,0.08),transparent_55%)]"
      />
      <div className="container-page space-y-6">
        <header className="rounded-2xl border border-av-line bg-av-surface/60 backdrop-blur-xl p-4 sm:p-5 overflow-hidden">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-av-green-deep/60 bg-av-green/10 text-av-green"
                aria-label="AV-INVEST Research - Home"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M3 17l5-5 4 4 9-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display truncate text-base font-semibold text-white sm:text-lg">
                    AV-INVEST <span className="text-av-green">RESEARCH</span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-av-green-deep/40 bg-av-green/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-av-green">
                    <ShieldCheck className="h-3 w-3" />
                    Area membri
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-av-muted">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 transition-colors hover:text-white"
                  >
                    <Home className="h-3.5 w-3.5" />
                    Torna al sito
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-xl border border-av-green-deep/50 bg-av-green/10 text-av-green">
                  {image ? (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <UserRound className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {name}
                  </p>
                  <p className="truncate text-xs text-av-muted">{email}</p>
                </div>
              </div>
              <form action={logoutAction} className="sm:flex-none">
                <button
                  type="submit"
                  className="btn-ghost w-full !py-2.5 !px-4 text-sm items-center justify-center gap-2 whitespace-nowrap"
                >
                  <LogOut className="h-4 w-4 text-av-green" />
                  LOGOUT
                </button>
              </form>
            </div>
          </div>

          <nav
            aria-label="Area membri - Navigazione"
            className="mt-4 flex flex-wrap gap-1.5 border-t border-av-line pt-4 sm:gap-2"
          >
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-xl border border-av-line bg-av-bg-2/50 px-3 py-2 text-sm font-medium text-av-muted transition-colors hover:border-av-green-deep/50 hover:text-white"
              >
                <Icon className="h-4 w-4 flex-none text-av-green" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            ))}
          </nav>
        </header>

        <div>{children}</div>
      </div>
    </div>
  );
}
