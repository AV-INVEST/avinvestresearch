'use client';

import { Phone } from 'lucide-react';
import { siteConfig } from '@/config/siteConfig';
import { useCallsAvailable } from '@/lib/sales/sales-client';

type Variant = 'lg' | 'nav';

interface Props {
  /** Riproduce dimensioni/padding del pulsante attuale (lg sezioni, nav barra). */
  variant: Variant;
  /** Classi del pulsante attivo: identiche a quelle già in uso, invariate. */
  className: string;
  /** aria-label usato quando le prenotazioni sono aperte. */
  ariaLabel: string;
  /** Dimensione dell'icona nel contesto (default h-5 w-5). */
  iconClassName?: string;
  /** Avvolge l'etichetta in uno span troncabile (Navbar). */
  truncateLabel?: boolean;
}

const LABEL_OPEN = 'PRENOTA UNA CALL';
const LABEL_CLOSED = 'CALL AL COMPLETO';

/**
 * Aspetto disabilitato (call al completo): dimensioni identiche, antracite,
 * testo chiaro, bordo sottile, nessun effetto hover. Le dimensioni base sono
 * ereditate dalla classe del pulsante attivo; il bordo è un ring inset così
 * da non alterare il box model (nessuno spostamento di layout).
 */
const DISABLED_BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl ring-1 ring-inset ring-av-line !bg-av-surface !text-white/75 hover:!bg-av-surface disabled:!opacity-100 cursor-not-allowed';

const DISABLED_SIZE: Record<Variant, string> = {
  lg: 'btn-primary-lg',
  nav: 'btn-primary !py-2.5 !px-3.5 text-sm whitespace-nowrap',
};

/**
 * Pulsante pubblico di prenotazione call orientativa. Lo stato dipende dallo
 * switch admin (`useCallsAvailable`): true = link Calendly attivo; false o
 * `null` (prima lettura non completata) = pulsante disabilitato, non cliccabile.
 * Non modifica né l'URL Calendly né le prenotazioni esistenti.
 */
export default function CallBookingButton({
  variant,
  className,
  ariaLabel,
  iconClassName = 'h-5 w-5',
  truncateLabel = false,
}: Props) {
  const callsAvailable = useCallsAvailable();
  // ON solo quando lo stato è noto e disponibile: lo stato sconosciuto (null)
  // resta non cliccabile, senza mostrare temporaneamente un link attivo.
  const enabled = callsAvailable === true;
  const label = callsAvailable === false ? LABEL_CLOSED : LABEL_OPEN;
  const labelNode = truncateLabel ? <span className="truncate">{label}</span> : label;
  const icon = <Phone className={`${iconClassName} flex-none`} aria-hidden="true" />;

  if (!enabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label="Prenotazioni call non disponibili"
        className={`${DISABLED_SIZE[variant]} ${DISABLED_BASE}`}
      >
        {icon}
        {labelNode}
      </button>
    );
  }

  return (
    <a
      href={siteConfig.calendlyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={ariaLabel}
    >
      {icon}
      {labelNode}
    </a>
  );
}
