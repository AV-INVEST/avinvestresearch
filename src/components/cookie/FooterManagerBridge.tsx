'use client';

import { useEffect } from 'react';
import { useCookieConsent } from './CookieConsentContext';

export default function FooterManagerBridge() {
  const { setOpen } = useCookieConsent();

  useEffect(() => {
    const handler = () => setOpen(true, false);
    window.addEventListener('av:open-cookie-preferences', handler);
    const attrHandler = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.matches && target.matches('[data-av-open-cookie-manager]')) {
        setOpen(true, false);
      }
    };
    document.addEventListener('click', attrHandler, true);
    return () => {
      window.removeEventListener('av:open-cookie-preferences', handler);
      document.removeEventListener('click', attrHandler, true);
    };
  }, [setOpen]);

  return null;
}
