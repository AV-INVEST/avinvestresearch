'use client';

import Link from 'next/link';
import { Mail, Linkedin, Instagram, Cookie } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import LastUpdatedLabel from '@/components/ui/LastUpdatedLabel';

interface FooterProps {}

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookie' },
  { label: 'Termini e condizioni', href: '/termini' },
  { label: 'Disclaimer finanziario', href: '/disclaimer' },
];

export default function Footer() {
  const socials = [
    {
      href: siteConfig.social.linkedin,
      label: 'LinkedIn (link esterno)',
      Icon: Linkedin,
    },
    {
      href: siteConfig.social.instagram,
      label: 'Instagram (link esterno)',
      Icon: Instagram,
    },
  ];

  return (
    <footer className="relative border-t border-av-line bg-av-bg pt-16 pb-28 sm:pb-16">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Home">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-green-deep/60 bg-av-green/10 text-av-green">
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
              </span>
              <span className="font-display text-base font-semibold tracking-wide text-white sm:text-lg">
                AV-INVEST <span className="text-av-green">RESEARCH</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-av-muted">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socials.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-av-line bg-av-surface/60 text-av-muted transition-colors hover:border-av-green-deep/60 hover:text-av-green"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
              Navigazione
            </p>
            <ul className="mt-5 space-y-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="link-underline text-sm">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/guide" className="link-underline text-sm">Guide</Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
              Legale
            </p>
            <ul className="mt-5 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="link-underline text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('av:open-cookie-preferences'));
                    }
                  }}
                  data-av-open-cookie-manager
                  className="link-underline inline-flex items-center gap-1.5 text-left text-sm"
                >
                  <Cookie className="h-3.5 w-3.5 text-av-green" />
                  Gestisci cookie
                </button>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-av-green">
              Contatti
            </p>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="inline-flex items-center gap-3 text-av-muted transition-colors hover:text-white break-all"
                >
                  <Mail className="h-4 w-4 flex-none text-av-green" />
                  <span>{siteConfig.contactEmail}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.calendlyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-av-muted transition-colors hover:text-white"
                >
                  <span className="grid h-4 w-4 flex-none place-items-center text-av-green">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>PRENOTA UNA CALL</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-av-line pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-av-muted sm:text-sm">
            {siteConfig.legal.disclaimer}
          </p>
          <div className="mt-8 flex flex-col items-start justify-between gap-4 text-xs text-av-muted sm:flex-row sm:items-center">
            <p>
              © {new Date().getFullYear()} {siteConfig.legal.companyName}. Tutti i diritti
              riservati.
            </p>
            <p className="max-w-md text-left sm:text-right">
              <LastUpdatedLabel prefix="Ultimo aggiornamento: " suffix="." />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
