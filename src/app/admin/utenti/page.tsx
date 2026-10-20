import type { Metadata } from 'next';
import Link from 'next/link';
import GlassCard from '@/components/ui/GlassCard';
import { AlertTriangle, Search, Users } from 'lucide-react';
import {
  listAdminUsers,
  type AdminUserRow,
  type AdminUserStatus,
} from '@/lib/admin/user-admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Utenti',
  robots: { index: false, follow: false },
};

type Filter = 'mai' | 'tutti' | 'clienti';

const FILTERS: Array<{ value: Filter; label: string }> = [
  { value: 'mai', label: 'MAI ACQUISTATO' },
  { value: 'tutti', label: 'TUTTI' },
  { value: 'clienti', label: 'CLIENTI' },
];

const STATUS_LABEL: Record<AdminUserStatus, string> = {
  CLIENTE: 'Cliente',
  OMAGGIO: 'Omaggio',
  MAI_ACQUISTATO: 'Mai acquistato',
};

const STATUS_CLASS: Record<AdminUserStatus, string> = {
  CLIENTE: 'border-av-green-deep/50 bg-av-green/10 text-av-green',
  OMAGGIO: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  MAI_ACQUISTATO: 'border-av-line bg-av-bg-2/70 text-av-muted',
};

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/Rome',
});

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return dateFormatter.format(date);
}

function matchesFilter(user: AdminUserRow, filter: Filter): boolean {
  if (filter === 'clienti') return user.paid;
  if (filter === 'mai') return !user.paid;
  return true;
}

export default async function AdminUtentiPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = searchParams ? await searchParams : {};
  const filterParam = typeof sp?.filter === 'string' ? sp.filter : '';
  const filter: Filter =
    filterParam === 'tutti' || filterParam === 'clienti' ? filterParam : 'mai';
  const query = typeof sp?.q === 'string' ? sp.q.trim() : '';

  const result = await listAdminUsers();

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">Utenti</h1>
        <GlassCard className="border-red-500/30 bg-red-500/[0.03] overflow-hidden p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-red-500/40 bg-red-500/10 text-red-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-lg font-semibold text-white">
                Elenco non disponibile
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-av-muted break-words">
                {result.error}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const all = result.users;
  const counts: Record<Filter, number> = {
    mai: all.filter((user) => !user.paid).length,
    tutti: all.length,
    clienti: all.filter((user) => user.paid).length,
  };
  const normalizedQuery = query.toLowerCase();
  const visible = all.filter((user) => {
    if (!matchesFilter(user, filter)) return false;
    if (normalizedQuery && !user.email.toLowerCase().includes(normalizedQuery)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="inline-flex items-center gap-2 rounded-full border border-av-green-deep/40 bg-av-green/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-av-green">
          <Users className="h-3.5 w-3.5" />
          Utenti registrati
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-white sm:text-3xl">
          Utenti
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-av-muted sm:text-base">
          Elenco in sola lettura degli utenti registrati con Google. Il filtro
          predefinito evidenzia chi non ha mai effettuato acquisti. Ordinamento
          per registrazione pi&ugrave; recente.
        </p>
      </div>

      <GlassCard className="overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => {
              const active = filter === value;
              const href = `/admin/utenti?filter=${value}${
                query ? `&q=${encodeURIComponent(query)}` : ''
              }`;
              return (
                <Link
                  key={value}
                  href={href}
                  aria-current={active ? 'true' : undefined}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? 'border-av-green-deep/60 bg-av-green/10 text-av-green'
                      : 'border-av-line bg-av-bg-2/50 text-av-muted hover:border-av-green-deep/50 hover:text-white'
                  }`}
                >
                  {label}
                  <span className="rounded-full bg-av-bg-2/80 px-2 py-0.5 text-[10px] text-white">
                    {counts[value]}
                  </span>
                </Link>
              );
            })}
          </div>

          <form method="get" action="/admin/utenti" className="flex flex-col gap-2 sm:flex-row">
            <input type="hidden" name="filter" value={filter} />
            <label className="sr-only" htmlFor="utenti-search">
              Cerca utente per email
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-av-muted" />
              <input
                id="utenti-search"
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Cerca per email"
                className="w-full rounded-xl border border-av-line bg-av-bg-2/50 py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-av-muted focus:border-av-green-deep/60 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="btn-primary justify-center gap-2 shadow-glow-green-sm !py-2.5 !px-4 text-sm"
            >
              Cerca
            </button>
          </form>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0">
        {visible.length === 0 ? (
          <p className="p-6 text-sm text-av-muted">
            Nessun utente corrisponde ai criteri selezionati.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-av-muted">
                  <th scope="col" className="px-4 py-3 font-medium">Email</th>
                  <th scope="col" className="px-4 py-3 font-medium">Nome</th>
                  <th scope="col" className="px-4 py-3 font-medium">Registrazione</th>
                  <th scope="col" className="px-4 py-3 font-medium">Stato cliente</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user.email} className="border-t border-av-line align-top">
                    <td className="px-4 py-3 text-white break-all">{user.email}</td>
                    <td className="px-4 py-3 text-av-muted">{user.name || '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-av-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_CLASS[user.status]}`}
                        >
                          {STATUS_LABEL[user.status]}
                        </span>
                        {user.evidence.length > 0 ? (
                          <span className="text-[11px] text-av-muted">
                            {user.evidence.join(' · ')}
                          </span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <p className="text-xs text-av-muted">
        Visualizzati {visible.length} di {all.length} utenti. Classificazione
        basata su acquisti (anche rimborsati), abbonamenti (anche cessati),
        pagamenti verificati manualmente e accessi omaggio.
      </p>
    </div>
  );
}
