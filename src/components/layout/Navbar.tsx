'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, Phone, User } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
            <Link
              href="/login"
              className="btn-ghost !py-2.5 !px-3.5 text-sm whitespace-nowrap"
              aria-label="Accedi all'area membri"
            >
              <User className="h-4 w-4 flex-none text-av-green" />
              Accedi
            </Link>
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
        id="mobile-menu"
        className={`lg:hidden overflow-hidden border-t border-av-line bg-av-bg/95 backdrop-blur-xl transition-[max-height,opacity] duration-300 ${
          open ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="container-page flex flex-col gap-1 py-4" aria-label="Menu mobile">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-white transition-colors hover:bg-av-surface"
            >
              {item.label}
            </Link>
          ))}
          {showMember ? (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-base font-medium text-av-muted transition-colors hover:bg-av-surface hover:text-white inline-flex items-center gap-3"
            >
              <User className="h-5 w-5 flex-none text-av-green" />
              Accedi all&apos;area membri
            </Link>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 px-1 pb-2">
            <a
              href={siteConfig.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="btn-primary-lg w-full shadow-glow-green-sm break-words"
              aria-label="Prenota una call - Link Calendly (si apre in una nuova scheda)"
            >
              <Phone className="h-5 w-5 flex-none" />
              PRENOTA UNA CALL
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
