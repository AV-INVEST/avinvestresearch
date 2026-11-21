'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  buildDefaultSalesState,
  normalizeSalesState,
  type SaleProductKey,
  type SaleProductState,
  type SalesState,
} from './sales-shared';

/**
 * Stato vendite condiviso lato client.
 *
 * - Il valore iniziale arriva dal server (`SalesProvider`) così badge e pulsanti
 *   sono corretti sin dal primo render, senza sfarfallii.
 * - L'aggiornamento per le pagine già aperte è leggero: una singola richiesta
 *   `no-store` al mount e un controllo quando la scheda torna visibile
 *   (throttle 60s). Nessun polling, nessuna connessione permanente.
 */
const SalesContext = createContext<SalesState | null>(null);

const DEFAULT_SALES_STATE = buildDefaultSalesState();
const MIN_REFRESH_MS = 60_000;

let inflight: Promise<SalesState | null> | null = null;
let lastFetchedAt = 0;

function fetchSalesState(): Promise<SalesState | null> {
  if (inflight) return inflight;
  inflight = fetch('/api/sales', { cache: 'no-store' })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => (data ? normalizeSalesState(data) : null))
    .catch(() => null)
    .finally(() => {
      inflight = null;
      lastFetchedAt = Date.now();
    });
  return inflight;
}

export function SalesProvider({
  initialState,
  children,
}: {
  initialState: SalesState;
  children: ReactNode;
}) {
  const [state, setState] = useState<SalesState>(initialState);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const next = await fetchSalesState();
      if (!cancelled && next) setState(next);
    };

    void refresh();

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedAt < MIN_REFRESH_MS) return;
      void refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  return <SalesContext.Provider value={state}>{children}</SalesContext.Provider>;
}

export function useSales(): SalesState {
  return useContext(SalesContext) ?? DEFAULT_SALES_STATE;
}

export function useSale(key: SaleProductKey): SaleProductState {
  return useSales().products[key];
}

/**
 * Disponibilità delle call orientative per i pulsanti pubblici.
 *
 * - Dentro il `SalesProvider` (homepage) legge lo stato condiviso: nessuna
 *   richiesta aggiuntiva e valore sempre definito.
 * - Fuori dal provider (es. Navbar nel layout globale) esegue UNA sola lettura
 *   client dell'endpoint `/api/sales`, riusando la stessa logica e la stessa
 *   cache/throttle del provider: nessun polling, nessuna connessione permanente.
 *
 * Ritorna `null` finché lo stato non è stato letto: il consumatore deve trattare
 * lo stato sconosciuto come NON cliccabile (nessun link attivo temporaneo).
 *
 * Retrocompatibilità: a lettura completata, campo `callsAvailable` assente = true.
 */
export function useCallsAvailable(): boolean | null {
  const ctx = useContext(SalesContext);
  const [remote, setRemote] = useState<boolean | null>(null);

  useEffect(() => {
    if (ctx) return;
    let cancelled = false;
    const refresh = async () => {
      const next = await fetchSalesState();
      if (!cancelled && next) setRemote(next.callsAvailable);
    };

    void refresh();

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - lastFetchedAt < MIN_REFRESH_MS) return;
      void refresh();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [ctx]);

  if (ctx) return ctx.callsAvailable;
  // `null` = prima lettura non ancora completata: stato sconosciuto, non ON.
  return remote;
}
