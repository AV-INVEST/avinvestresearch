import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';

export const metadata: Metadata = {
  title: 'Informazioni legali',
  description:
    'Informazioni legali sul venditore e sui dati di contatto di AV-INVEST Research.',
  alternates: { canonical: 'https://avinvestresearch.com/informazioni-legali' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function InformazioniLegaliPage() {
  const identity = siteConfig.legal.identity;

  return (
    <LegalLayout
      title="Informazioni legali"
      subtitle="Dati del venditore e informazioni generali previste dalla normativa applicabile."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          Dati del venditore
        </h2>
        <p className="mt-2">
          I prodotti e i servizi presenti sul sito sono venduti da persona fisica
          nell&apos;esercizio della propria attivit&agrave; professionale, secondo
          la normativa applicabile.
        </p>
        <div className="mt-4 rounded-2xl border border-av-line bg-av-bg-2/40 p-5 sm:p-6">
          <dl className="grid gap-4 sm:grid-cols-[auto_1fr] sm:gap-x-6 sm:gap-y-4">
            {identity.fullName ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Nome e cognome
                </dt>
                <dd className="text-white/90">{identity.fullName}</dd>
              </>
            ) : null}

            {identity.address ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Indirizzo / Domicilio
                </dt>
                <dd className="text-white/90">{identity.address}</dd>
              </>
            ) : null}

            {identity.email ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Email
                </dt>
                <dd className="text-white/90 break-all">
                  <a href={`mailto:${identity.email}`} className="link-underline">
                    {identity.email}
                  </a>
                </dd>
              </>
            ) : null}

            {identity.phone ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Telefono
                </dt>
                <dd className="text-white/90">
                  <a href={`tel:${identity.phone.replace(/\s+/g, '')}`} className="link-underline">
                    {identity.phone}
                  </a>
                </dd>
              </>
            ) : null}

            {identity.vatId ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Partita IVA
                </dt>
                <dd className="text-white/90">{identity.vatId}</dd>
              </>
            ) : null}

            {identity.fiscalCode ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  Codice Fiscale
                </dt>
                <dd className="text-white/90">{identity.fiscalCode}</dd>
              </>
            ) : null}

            {identity.companyRegister ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  REA / Registro Imprese
                </dt>
                <dd className="text-white/90">{identity.companyRegister}</dd>
              </>
            ) : null}

            {identity.pec ? (
              <>
                <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-av-green">
                  PEC
                </dt>
                <dd className="text-white/90 break-all">
                  <a href={`mailto:${identity.pec}`} className="link-underline">
                    {identity.pec}
                  </a>
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          Note
        </h2>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            L&apos;attivit&agrave; &egrave; esercitata da persona fisica, secondo
            limiti e modalit&agrave; previste dalla normativa vigente.
          </li>
          <li>
            Per richieste, assistenza post-vendita o chiarimenti sui servizi
            offerti, utilizza i riferimenti di contatto riportati sopra o
            consulta la sezione <a href="/termini" className="link-underline">Termini e condizioni</a>.
          </li>
          <li>
            Informative aggiuntive in materia di privacy sono disponibili nella
            sezione <a href="/privacy" className="link-underline">Privacy Policy</a>.
          </li>
        </ul>
      </section>
    </LegalLayout>
  );
}
