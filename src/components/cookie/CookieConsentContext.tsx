'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { cookieCategories, cookieConsentVersion, type CookieCategory } from '@/config/cookieConfig';

export interface ConsentState {
  version: number;
  timestamp: number;
  categories: Record<CookieCategory, boolean>;
}

export const AV_CONSENT_KEY = 'av-consent';

const defaultCategories: Record<CookieCategory, boolean> = {
  necessari: true,
  preferenze: false,
  analitici: false,
  marketing: false,
};

const defaultState: ConsentState = {
  version: cookieConsentVersion,
  timestamp: 0,
  categories: { ...defaultCategories },
};

interface CookieContextValue {
  open: boolean;
  showPreferences: boolean;
  state: ConsentState;
  setOpen: (open: boolean, showPrefs?: boolean) => void;
  acceptAll: () => void;
  rejectNonNecessary: () => void;
  savePreferences: (next: Record<CookieCategory, boolean>) => void;
  togglePreferences: () => void;
}

const CookieContext = createContext<CookieContextValue | null>(null);

function readConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AV_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (parsed.version !== cookieConsentVersion) return null;
    if (!parsed.categories || typeof parsed.categories !== 'object') return null;
    return {
      version: parsed.version,
      timestamp: Number(parsed.timestamp) || 0,
      categories: { ...defaultCategories, ...parsed.categories, necessari: true },
    };
  } catch {
    return null;
  }
}

function writeConsent(categories: Record<CookieCategory, boolean>) {
  const state: ConsentState = {
    version: cookieConsentVersion,
    timestamp: Date.now(),
    categories: { ...categories, necessari: true },
  };
  try {
    window.localStorage.setItem(AV_CONSENT_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
  return state;
}

export function CookieProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConsentState>(defaultState);
  const [open, setOpenInner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = readConsent();
    if (stored) {
      setState(stored);
      setOpenInner(false);
    } else {
      setOpenInner(true);
    }
  }, []);

  const setOpen = useCallback((nextOpen: boolean, showPrefs?: boolean) => {
    setOpenInner(nextOpen);
    if (nextOpen && typeof showPrefs === 'boolean') setShowPreferences(showPrefs);
  }, []);

  const acceptAll = useCallback(() => {
    const next = { ...defaultCategories, preferenze: true, analitici: true, marketing: true };
    const saved = writeConsent(next);
    setState(saved);
    setOpenInner(false);
    setShowPreferences(false);
  }, []);

  const rejectNonNecessary = useCallback(() => {
    const saved = writeConsent({ ...defaultCategories });
    setState(saved);
    setOpenInner(false);
    setShowPreferences(false);
  }, []);

  const savePreferences = useCallback((next: Record<CookieCategory, boolean>) => {
    const merged: Record<CookieCategory, boolean> = {
      ...next,
      necessari: true,
    };
    const saved = writeConsent(merged);
    setState(saved);
    setOpenInner(false);
    setShowPreferences(false);
  }, []);

  const togglePreferences = useCallback(() => {
    setShowPreferences((p) => !p);
  }, []);

  const value = useMemo<CookieContextValue>(
    () => ({
      open,
      showPreferences,
      state,
      setOpen,
      acceptAll,
      rejectNonNecessary,
      savePreferences,
      togglePreferences,
    }),
    [open, showPreferences, state, setOpen, acceptAll, rejectNonNecessary, savePreferences, togglePreferences],
  );

  return <CookieContext.Provider value={value}>{children}</CookieContext.Provider>;
}

export function useCookieConsent(): CookieContextValue {
  const ctx = useContext(CookieContext);
  if (!ctx) {
    throw new Error('useCookieConsent must be used within CookieProvider');
  }
  return ctx;
}

export { cookieCategories };
