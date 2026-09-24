'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Phone, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { siteConfig } from '@/config/siteConfig';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const authenticated = !authLoading && !!session?.user;
  const showMember = siteConfig.featureFlags.memberAreaEnabled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-av-line/80 bg-av-bg/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Link
          href="/"
          className="group flex items-center gap-2 min-w-0"
          aria-label="AV-INVEST Research - Home"
        >
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg border border-av-green-deep/60 bg-av-green/10 text-av-green">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                d="M3 17l5-5 4 4 9-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="font-display truncate text-sm font-semibold tracking-wide text-white sm:text-base">
            AV-INVEST <span className="text-av-green">RESEARCH</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="Navigazione principale">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="link-underline text-sm font-medium whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {showMember ? (
            authenticated ? (
              <Link
                href="/area-membri"
                className="btn-ghost !py-2.5 !px-3.5 text-sm whitespace-nowrap"
                aria-label="Vai all'area membri"
              >
                <User className="h-4 w-4 flex-none text-av-green" />
                Area membri
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-ghost !py-2.5 !px-3.5 text-sm whitespace-nowrap"
                aria-label="Accedi all'area membri"
              >
                <User className="h-4 w-4 flex-none text-av-green" />
                Accedi
              </Link>
            )
          ) : null}
          <a
            href={siteConfig.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-2.5 !px-3.5 text-sm shadow-glow-green-sm whitespace-nowrap"
            aria-label="Prenota una call - Link Calendly (si apre in una nuova scheda)"
          >
            <Phone className="h-4 w-4 flex-none" />
            <span className="truncate">PRENOTA UNA CALL</span>
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-av-line bg-av-surface/60 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Chiudi menu' : 'Apri menu'}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        aria-hidden={!open}
        onClick={() => setOpen(false)}
        className={`fixed inset-x-0 bottom-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          open
            ? 'top-16 sm:top-20 opacity-100 pointer-events-auto'
            : 'top-0 opacity-0 pointer-events-none'
        }`}
      />

      <div
        id="mobile-menu"
        role="region"
        aria-label="Menu mobile"
        aria-hidden={!open}
        className={`fixed z-[44] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md sm:left-auto sm:right-5 sm:translate-x-0 sm:w-[380px] top-[72px] sm:top-[88px] rounded-2xl border border-av-line bg-av-bg/95 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.02)] p-3 sm:p-4 lg:hidden origin-top transition-all duration-200 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto visible'
            : 'opacity-0 -translate-y-2 pointer-events-none invisible'
        }`}
      >
        <nav className="flex flex-col gap-0" aria-label="Menu mobile">
          <div className="grid grid-cols-2 gap-1.5">
            {siteConfig.navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-av-surface hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {showMember ? (
            authenticated ? (
              <Link
                href="/area-membri"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-av-green/[0.08] inline-flex items-center gap-2.5 border border-av-green-deep/50 bg-av-green/[0.06]"
              >
                <User className="h-4 w-4 flex-none text-av-green" />
                Area membri
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-av-green/[0.08] inline-flex items-center gap-2.5 border border-av-green-deep/50 bg-av-green/[0.06]"
              >
                <User className="h-4 w-4 flex-none text-av-green" />
                Accedi all&apos;area membri
              </Link>
            )
          ) : null}
        </nav>
      </div>
    </header>
  );
}
