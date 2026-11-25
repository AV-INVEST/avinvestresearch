'use client';

import { useEffect, useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, Minus, Play, Plus } from 'lucide-react';
import {
  updateCallsAvailability,
  updateHeroVideo,
  updatePromotion,
  updateSaleProduct,
} from './actions';
import {
  HERO_VIDEO_DEFAULT_TITLE,
  HERO_VIDEO_MAX,
  MAX_SALE_QUANTITY,
  PROMOTION_MAX,
  PROMOTION_THEMES,
  SALE_PRODUCT_KEYS,
  clampQuantity,
  parseYouTubeId,
  type HeroVideoState,
  type PromotionState,
  type PromotionTheme,
  type SaleProductKey,
  type SalesState,
} from '@/lib/sales/sales-shared';
import { PromotionBannerView } from '@/components/sales/PromotionBanner';

const PROMOTION_THEME_LABELS: Record<PromotionTheme, string> = {
  gold: 'Oro / Champagne',
  green: 'Verde neon',
  anthracite: 'Antracite',
};

const PRODUCT_META: Record<SaleProductKey, { title: string; note: string }> = {
  'market-lens': { title: 'AV Market Lens', note: 'Indicatore one-time' },
  foundations: { title: 'AV Foundations', note: 'Videocorso · analisi tecnica da zero' },
  'trading-lab': { title: 'AV Trading Lab', note: 'Videocorso · metodo operativo avanzato' },
  'complete-academy': {
    title: 'AV Complete Academy',
    note: 'Bundle: controlli indipendenti, l\u2019acquisto e l\u2019accesso ai due corsi restano invariati',
  },
};

interface Props {
  initial: SalesState;
  storageConfigured: boolean;
}

export default function VenditeManager({ initial, storageConfigured }: Props) {
  const [state, setState] = useState<SalesState>(initial);
  const [drafts, setDrafts] = useState<Record<SaleProductKey, string>>(() => toDrafts(initial));
  const [banner, setBanner] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [savingKey, setSavingKey] = useState<SaleProductKey | null>(null);
  const [savingCalls, setSavingCalls] = useState(false);
  // Campagna promozionale: `state.promotion` è la verità salvata, `promoDraft`
  // la copia modificabile localmente. Nessuna scrittura per carattere digitato.
  const [promoDraft, setPromoDraft] = useState<PromotionState>(initial.promotion);
  const [savingPromo, setSavingPromo] = useState(false);
  // Video testimonianze Hero: `state.heroVideo` è la verità salvata, `heroDraft`
  // la copia modificabile localmente. Nessuna scrittura per carattere digitato.
  const [heroDraft, setHeroDraft] = useState<HeroVideoState>(initial.heroVideo);
  const [savingHero, setSavingHero] = useState(false);

  const heroDirty =
    heroDraft.url !== state.heroVideo.url || heroDraft.title !== state.heroVideo.title;

  const setHeroField = <K extends keyof HeroVideoState>(key: K, value: HeroVideoState[K]) =>
    setHeroDraft((d) => ({ ...d, [key]: value }));

  const applyHero = (
    payload: Parameters<typeof updateHeroVideo>[0],
    onOk: (saved: HeroVideoState) => void,
    okText: (saved: HeroVideoState) => string,
  ) => {
    if (!storageConfigured || isPending) return;
    setSavingHero(true);
    setBanner(null);
    startTransition(async () => {
      const res = await updateHeroVideo(payload);
      if (res.ok && res.state) {
        setState(res.state);
        onOk(res.state.heroVideo);
        setBanner({ ok: true, text: okText(res.state.heroVideo) });
      } else {
        setBanner({ ok: false, text: res.error ?? 'Salvataggio non riuscito.' });
      }
      setSavingHero(false);
    });
  };

  const promoDirty =
    promoDraft.campaignName !== state.promotion.campaignName ||
    promoDraft.headline !== state.promotion.headline ||
    promoDraft.description !== state.promotion.description ||
    promoDraft.code !== state.promotion.code ||
    promoDraft.theme !== state.promotion.theme;

  const setPromoField = <K extends keyof PromotionState>(key: K, value: PromotionState[K]) =>
    setPromoDraft((d) => ({ ...d, [key]: value }));

  const applyPromotion = (
    payload: Parameters<typeof updatePromotion>[0],
    onOk: (saved: PromotionState, sentEnabled: boolean) => void,
    okText: (saved: PromotionState) => string,
  ) => {
    if (!storageConfigured || isPending) return;
    setSavingPromo(true);
    setBanner(null);
    startTransition(async () => {
      const res = await updatePromotion(payload);
      if (res.ok && res.state) {
        setState(res.state);
        onOk(res.state.promotion, payload.enabled === true);
        setBanner({ ok: true, text: okText(res.state.promotion) });
      } else {
        setBanner({ ok: false, text: res.error ?? 'Salvataggio non riuscito.' });
      }
      setSavingPromo(false);
    });
  };

  useEffect(() => {
    setDrafts(toDrafts(state));
  }, [state]);

  const apply = (key: SaleProductKey, patch: { available?: boolean; quantity?: number | null }) => {
    if (!storageConfigured || isPending) return;
    setSavingKey(key);
    setBanner(null);
    startTransition(async () => {
      const res = await updateSaleProduct(key, patch);
      if (res.ok && res.state) {
        setState(res.state);
        setBanner({ ok: true, text: `Modifiche salvate per ${PRODUCT_META[key].title}.` });
      } else {
        setBanner({ ok: false, text: res.error ?? 'Salvataggio non riuscito.' });
      }
      setSavingKey(null);
    });
  };

  const applyCalls = (available: boolean) => {
    if (!storageConfigured || isPending) return;
    setSavingCalls(true);
    setBanner(null);
    startTransition(async () => {
      const res = await updateCallsAvailability(available);
      if (res.ok && res.state) {
        setState(res.state);
        setBanner({
          ok: true,
          text: available ? 'Prenotazioni call aperte.' : 'Call impostate al completo.',
        });
      } else {
        setBanner({ ok: false, text: res.error ?? 'Salvataggio non riuscito.' });
      }
      setSavingCalls(false);
    });
  };

  /** Switch ON/OFF salvato direttamente. ON invia i testi correnti così da
   *  validare subito nome, titolo e codice; OFF preserva i testi salvati. */
  const togglePromotion = () => {
    const next = !state.promotion.enabled;
    applyPromotion(
      next ? { ...promoDraft, enabled: true } : { enabled: false },
      (saved) => {
        setPromoDraft(next ? saved : (d) => ({ ...d, enabled: false }));
      },
      (saved) => (saved.enabled ? 'Campagna promozionale attivata.' : 'Campagna promozionale disattivata.'),
    );
  };

  /** Salva l'intera campagna con un solo click (testi, tema e stato). */
  const savePromotion = () => {
    applyPromotion(
      { ...promoDraft },
      (saved) => setPromoDraft(saved),
      () => 'Campagna promozionale salvata.',
    );
  };

  /** Switch ON/OFF del video. ON invia il link corrente così da validarlo subito;
   *  OFF preserva link e titolo salvati. */
  const toggleHero = () => {
    const next = !state.heroVideo.enabled;
    applyHero(
      next ? { ...heroDraft, enabled: true } : { ...heroDraft, enabled: false },
      (saved) => setHeroDraft(saved),
      (saved) =>
        saved.enabled ? 'Video testimonianze attivato nella Hero.' : 'Video testimonianze disattivato.',
    );
  };

  /** Salva link e titolo con un solo click (nessuna scrittura per carattere). */
  const saveHero = () => {
    applyHero(
      { ...heroDraft },
      (saved) => setHeroDraft(saved),
      () => 'Video Hero salvato.',
    );
  };

  const heroPreviewId = parseYouTubeId(heroDraft.url);
  const heroPreviewTitle = heroDraft.title.trim() || HERO_VIDEO_DEFAULT_TITLE;

  const previewPromotion: PromotionState = {
    ...promoDraft,
    campaignName: promoDraft.campaignName || 'NOME CAMPAGNA',
    headline: promoDraft.headline || 'Titolo promozionale di esempio.',
    code: promoDraft.code || 'CODICE',
  };

  const commitQuantity = (key: SaleProductKey) => {
    const raw = drafts[key].trim();
    const quantity = raw === '' ? null : clampQuantity(raw);
    const current = state.products[key].quantity;
    if (quantity === current) {
      setDrafts((d) => ({ ...d, [key]: quantity === null ? '' : String(quantity) }));
      return;
    }
    apply(key, { quantity });
  };

  const step = (key: SaleProductKey, delta: 1 | -1) => {
    const current = state.products[key].quantity;
    if (delta === -1 && current === null) return;
    const base = current ?? 0;
    const next = Math.min(MAX_SALE_QUANTITY, Math.max(0, base + delta));
    apply(key, { quantity: next });
  };

  return (
    <div className="space-y-5">
      {!storageConfigured ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/40 bg-amber-400/[0.06] px-4 py-3 text-sm text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          <p className="leading-relaxed">
            Storage Vercel Blob non configurato (<code className="text-amber-100">BLOB_READ_WRITE_TOKEN</code>).
            Le modifiche non possono essere salvate in modo persistente finché la variabile non è impostata.
          </p>
        </div>
      ) : null}

      {banner ? (
        <p
          role="status"
          aria-live="polite"
          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
            banner.ok ? 'text-av-green' : 'text-red-300'
          }`}
        >
          {banner.ok ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          {banner.text}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        {SALE_PRODUCT_KEYS.map((key) => {
          const meta = PRODUCT_META[key];
          const sale = state.products[key];
          const saving = isPending && savingKey === key;
          const closed = !sale.available || sale.quantity === 0;

          return (
            <div
              key={key}
              className="relative flex h-full flex-col gap-4 rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold text-white break-words">
                    {meta.title}
                  </h3>
                  <p className="mt-1 text-xs leading-snug text-av-muted break-words">
                    {meta.note}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={sale.available}
                  aria-label={`Disponibilità ${meta.title}`}
                  disabled={!storageConfigured || isPending}
                  onClick={() => apply(key, { available: !sale.available })}
                  className={[
                    'relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors disabled:opacity-50',
                    sale.available
                      ? 'border-av-green-deep/60 bg-av-green/30'
                      : 'border-av-line bg-av-bg-2',
                  ].join(' ')}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'inline-block h-4 w-4 transform rounded-full transition-transform',
                      sale.available
                        ? 'translate-x-6 bg-av-green'
                        : 'translate-x-1 bg-av-muted',
                    ].join(' ')}
                  />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={[
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                    closed
                      ? 'border-av-line bg-av-bg-2/70 text-av-muted'
                      : 'border-av-green-deep/40 bg-av-green/10 text-av-green',
                  ].join(' ')}
                >
                  {closed ? 'Vendite chiuse' : 'Disponibile'}
                </span>
                {saving ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-av-muted">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Salvataggio...
                  </span>
                ) : null}
              </div>

              <div className="mt-auto">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
                  Accessi impostati manualmente
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(key, -1)}
                    disabled={!storageConfigured || isPending || sale.quantity === null}
                    aria-label={`Riduci accessi ${meta.title}`}
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-bg-2/60 text-white transition-colors hover:border-av-green-deep/50 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={MAX_SALE_QUANTITY}
                    value={drafts[key]}
                    placeholder="Non configurato"
                    disabled={!storageConfigured}
                    aria-label={`Numero di accessi ${meta.title}`}
                    onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                    onBlur={() => commitQuantity(key)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    }}
                    className="h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => step(key, 1)}
                    disabled={!storageConfigured || isPending}
                    aria-label={`Aumenta accessi ${meta.title}`}
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-av-line bg-av-bg-2/60 text-white transition-colors hover:border-av-green-deep/50 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-white">Call orientative</h3>
            <p className="mt-1 text-xs leading-snug text-av-muted">
              Controlla i pulsanti &laquo;PRENOTA UNA CALL&raquo; del sito. Le prenotazioni
              Calendly già esistenti non vengono modificate.
            </p>
          </div>
          <div className="flex flex-none items-center gap-3">
            <span
              className={[
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                state.callsAvailable
                  ? 'border-av-green-deep/40 bg-av-green/10 text-av-green'
                  : 'border-av-line bg-av-bg-2/70 text-av-muted',
              ].join(' ')}
            >
              {state.callsAvailable ? 'Prenotazioni aperte' : 'Call al completo'}
            </span>
            {savingCalls ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-av-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvataggio...
              </span>
            ) : null}
            <button
              type="button"
              role="switch"
              aria-checked={state.callsAvailable}
              aria-label="Prenotazioni call orientative"
              disabled={!storageConfigured || isPending}
              onClick={() => applyCalls(!state.callsAvailable)}
              className={[
                'relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors disabled:opacity-50',
                state.callsAvailable
                  ? 'border-av-green-deep/60 bg-av-green/30'
                  : 'border-av-line bg-av-bg-2',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-block h-4 w-4 transform rounded-full transition-transform',
                  state.callsAvailable
                    ? 'translate-x-6 bg-av-green'
                    : 'translate-x-1 bg-av-muted',
                ].join(' ')}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-white">
              Campagna promozionale
            </h3>
            <p className="mt-1 text-xs leading-snug text-av-muted">
              Banner riutilizzabile tutto l&apos;anno nella Hero della homepage. Il codice è solo
              comunicativo: viene creato e gestito manualmente nella Dashboard Stripe e non è
              applicato automaticamente al checkout.
            </p>
          </div>
          <div className="flex flex-none items-center gap-3">
            <span
              className={[
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                state.promotion.enabled
                  ? 'border-av-green-deep/40 bg-av-green/10 text-av-green'
                  : 'border-av-line bg-av-bg-2/70 text-av-muted',
              ].join(' ')}
            >
              {state.promotion.enabled ? 'Attiva' : 'Disattivata'}
            </span>
            {savingPromo ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-av-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvataggio...
              </span>
            ) : null}
            <button
              type="button"
              role="switch"
              aria-checked={state.promotion.enabled}
              aria-label="Banner promozionale attivo"
              disabled={!storageConfigured || isPending}
              onClick={togglePromotion}
              className={[
                'relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors disabled:opacity-50',
                state.promotion.enabled
                  ? 'border-av-green-deep/60 bg-av-green/30'
                  : 'border-av-line bg-av-bg-2',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-block h-4 w-4 transform rounded-full transition-transform',
                  state.promotion.enabled
                    ? 'translate-x-6 bg-av-green'
                    : 'translate-x-1 bg-av-muted',
                ].join(' ')}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Nome campagna
            </span>
            <input
              type="text"
              value={promoDraft.campaignName}
              maxLength={PROMOTION_MAX.campaignName}
              disabled={!storageConfigured}
              onChange={(e) => setPromoField('campaignName', e.target.value)}
              placeholder="BLACK FRIDAY"
              className="mt-2 h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Codice sconto
            </span>
            <input
              type="text"
              value={promoDraft.code}
              maxLength={PROMOTION_MAX.code}
              disabled={!storageConfigured}
              onChange={(e) => setPromoField('code', e.target.value)}
              placeholder="AVFRIDAY20"
              className="mt-2 h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 font-mono text-sm tracking-wider text-white placeholder:font-sans placeholder:tracking-normal placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Titolo promozionale
            </span>
            <input
              type="text"
              value={promoDraft.headline}
              maxLength={PROMOTION_MAX.headline}
              disabled={!storageConfigured}
              onChange={(e) => setPromoField('headline', e.target.value)}
              placeholder="La formazione che cercavi. Ora con il 20% di sconto."
              className="mt-2 h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
          </label>

          <label className="block sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Descrizione
            </span>
            <textarea
              value={promoDraft.description}
              maxLength={PROMOTION_MAX.description}
              rows={2}
              disabled={!storageConfigured}
              onChange={(e) => setPromoField('description', e.target.value)}
              placeholder="Su prodotti selezionati, utilizza il codice promozionale al checkout."
              className="mt-2 w-full min-w-0 resize-none rounded-lg border border-av-line bg-av-bg-2/60 px-3 py-2 text-sm leading-relaxed text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Tema colore
            </span>
            <div role="radiogroup" aria-label="Tema colore banner" className="mt-2 flex flex-wrap gap-2">
              {PROMOTION_THEMES.map((theme) => {
                const active = promoDraft.theme === theme;
                const dotClass =
                  theme === 'gold'
                    ? 'bg-[#C9A961]'
                    : theme === 'green'
                      ? 'bg-av-green'
                      : 'bg-white/70';
                return (
                  <button
                    key={theme}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!storageConfigured}
                    onClick={() => setPromoField('theme', theme)}
                    className={[
                      'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50',
                      active
                        ? 'border-av-green-deep/60 bg-av-green/10 text-white'
                        : 'border-av-line bg-av-bg-2/60 text-av-muted hover:text-white',
                    ].join(' ')}
                  >
                    <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                    {PROMOTION_THEME_LABELS[theme]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
            Anteprima
          </p>
          <div className="mt-2">
            <PromotionBannerView promotion={previewPromotion} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={savePromotion}
            disabled={!storageConfigured || isPending || !promoDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-av-green px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white focus-visible:outline-av-green disabled:opacity-40 disabled:hover:bg-av-green"
          >
            {savingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            SALVA MODIFICHE
          </button>
          {promoDirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200">
              <AlertCircle className="h-3.5 w-3.5" />
              Modifiche non salvate
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-av-line bg-av-surface/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-white">
              Video testimonianze — Hero
            </h3>
            <p className="mt-1 text-xs leading-snug text-av-muted">
              Sostituisce il riquadro &laquo;AV MARKET VIEW&raquo; della Hero con un video
              YouTube. Con lo switch OFF o senza un link valido la Hero mostra sempre il
              grafico originale. Il player carica solo dopo un clic dell&apos;utente.
            </p>
          </div>
          <div className="flex flex-none items-center gap-3">
            <span
              className={[
                'inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider',
                state.heroVideo.enabled
                  ? 'border-av-green-deep/40 bg-av-green/10 text-av-green'
                  : 'border-av-line bg-av-bg-2/70 text-av-muted',
              ].join(' ')}
            >
              {state.heroVideo.enabled ? 'Attivo' : 'Disattivato'}
            </span>
            {savingHero ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-av-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvataggio...
              </span>
            ) : null}
            <button
              type="button"
              role="switch"
              aria-checked={state.heroVideo.enabled}
              aria-label="Video testimonianze nella Hero attivo"
              disabled={!storageConfigured || isPending}
              onClick={toggleHero}
              className={[
                'relative inline-flex h-6 w-11 flex-none items-center rounded-full border transition-colors disabled:opacity-50',
                state.heroVideo.enabled
                  ? 'border-av-green-deep/60 bg-av-green/30'
                  : 'border-av-line bg-av-bg-2',
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'inline-block h-4 w-4 transform rounded-full transition-transform',
                  state.heroVideo.enabled
                    ? 'translate-x-6 bg-av-green'
                    : 'translate-x-1 bg-av-muted',
                ].join(' ')}
              />
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Link YouTube
            </span>
            <input
              type="url"
              value={heroDraft.url}
              maxLength={HERO_VIDEO_MAX.url}
              disabled={!storageConfigured}
              onChange={(e) => setHeroField('url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="mt-2 h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
            <span className="mt-1 block text-[11px] leading-snug text-av-muted/90">
              Ammessi: youtube.com/watch, youtu.be, shorts o live. Il link viene validato lato
              server prima del salvataggio.
            </span>
          </label>

          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
              Titolo visibile
            </span>
            <input
              type="text"
              value={heroDraft.title}
              maxLength={HERO_VIDEO_MAX.title}
              disabled={!storageConfigured}
              onChange={(e) => setHeroField('title', e.target.value)}
              placeholder={HERO_VIDEO_DEFAULT_TITLE}
              className="mt-2 h-9 w-full min-w-0 rounded-lg border border-av-line bg-av-bg-2/60 px-3 text-sm text-white placeholder:text-av-muted/70 focus:border-av-green-deep/60 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-av-muted">
            Anteprima
          </p>
          <div className="mt-2">
            {heroPreviewId ? (
              <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-av-line bg-black">
                <div className="relative aspect-video w-full">
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,106,0.12),transparent_65%)]"
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-av-green-deep/60 bg-av-green/10 text-av-green">
                      <Play className="h-5 w-5 translate-x-[1px]" />
                    </span>
                  </span>
                  <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/75 to-transparent p-3 font-display text-sm font-semibold text-white">
                    {heroPreviewTitle}
                  </span>
                </div>
              </div>
            ) : (
              <p
                className={[
                  'rounded-xl border px-3 py-2 text-xs leading-relaxed',
                  heroDraft.url.trim()
                    ? 'border-amber-400/40 bg-amber-400/[0.06] text-amber-200'
                    : 'border-av-line bg-av-bg-2/40 text-av-muted',
                ].join(' ')}
              >
                {heroDraft.url.trim()
                  ? 'Link non valido: la Hero mostra il grafico “AV MARKET VIEW” e il video non può essere attivato.'
                  : 'Nessun video configurato: la Hero mostra il grafico “AV MARKET VIEW”.'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={saveHero}
            disabled={!storageConfigured || isPending || !heroDirty}
            className="inline-flex items-center gap-2 rounded-xl bg-av-green px-4 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-white focus-visible:outline-av-green disabled:opacity-40 disabled:hover:bg-av-green"
          >
            {savingHero ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            SALVA MODIFICHE
          </button>
          {heroDirty ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200">
              <AlertCircle className="h-3.5 w-3.5" />
              Modifiche non salvate
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl border border-av-line bg-av-bg-2/40 px-4 py-3 text-xs leading-relaxed text-av-muted">
        <Info className="mt-0.5 h-4 w-4 flex-none text-av-green" />
        <p>
          La quantità è decisa esclusivamente dall&apos;amministratore: non viene decrementata
          dopo gli acquisti, non è sincronizzata con Stripe e non alimenta alcun magazzino.
          Lascia il campo vuoto per non mostrare alcun numero sul sito. Con switch su OFF o
          quantità a zero, le CTA diventano &laquo;Non disponibile&raquo; ma gli accessi di chi
          ha già acquistato restano invariati.
        </p>
      </div>
    </div>
  );
}

function toDrafts(state: SalesState): Record<SaleProductKey, string> {
  const out = {} as Record<SaleProductKey, string>;
  for (const key of SALE_PRODUCT_KEYS) {
    const q = state.products[key].quantity;
    out[key] = q === null ? '' : String(q);
  }
  return out;
}
