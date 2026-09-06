import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { cookieCategories, cookieTable } from '@/config/cookieConfig';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Informativa sui cookie e sulle tecnologie simili utilizzati su avinvestresearch.com, con tabella dei cookie realmente impiegati.',
  alternates: { canonical: 'https://avinvestresearch.com/cookie' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
};

export default function CookiePage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Informazioni sui cookie e tecnologie simili utilizzati sul sito avinvestresearch.com e sulle modalità di gestione del consenso."
    >
      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          1. Cosa sono i cookie
        </h2>
        <p>
          I cookie sono piccoli file di testo inviati dal sito al dispositivo dell&apos;utente
          e memorizzati al fine di migliorare l&apos;esperienza di navigazione, ricordare
          preferenze, analizzare il traffico e, solo previo consenso, supportare funzionalità
          aggiuntive o di marketing.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Categorie di cookie utilizzate
        </h2>
        <ul className="space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          {cookieCategories.map((c) => (
            <li key={c.id}>
              <strong className="text-white">{c.label}:</strong> {c.description}
              {c.alwaysActive ? (
                <span className="ml-2 text-xs text-av-green">Sempre attivi.</span>
              ) : (
                <span className="ml-2 text-xs text-av-muted">
                  Installati solo previo consenso.
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Cookie e tecnologie realmente utilizzati
        </h2>
        <p>
          La tabella seguente riporta le voci attualmente utilizzate dal sito. Eventuali
          nuove voci sono aggiunte in occasione della loro reale implementazione e, ove
          previsto, dopo raccolta del consenso.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-av-line text-left text-xs uppercase tracking-[0.14em] text-av-green">
                <th className="p-3 font-semibold">Nome</th>
                <th className="p-3 font-semibold">Tipo / Strumento</th>
                <th className="p-3 font-semibold">Categoria</th>
                <th className="p-3 font-semibold">Durata</th>
                <th className="p-3 font-semibold">Finalità</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-av-line">
              {cookieTable.map((row) => (
                <tr key={row.name} className="align-top">
                  <td className="p-3 font-mono text-xs text-white">{row.name}</td>
                  <td className="p-3">{row.type}</td>
                  <td className="p-3">{row.category}</td>
                  <td className="p-3">{row.expiry}</td>
                  <td className="p-3">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Gestione del consenso
        </h2>
        <p>
          Al primo accesso, o quando il consenso non è più valido, viene mostrato un
          pannello dedicato tramite cui puoi:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>Accettare tutte le categorie non necessarie.</li>
          <li>Rifiutare tutte le categorie non necessarie.</li>
          <li>Personalizzare le singole categorie.</li>
        </ul>
        <p className="mt-3">
          Le preferenze sono memorizzate localmente e possono essere modificate in qualsiasi
          momento dalla voce &quot;Gestisci cookie&quot; presente nel footer del sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Link esterni e strumenti di terze parti
        </h2>
        <p>
          Il sito può contenere link esterni (es. Calendly per la prenotazione di call,
          profili social). Questi strumenti operano come siti autonomi e titolari di
          autonomi trattamenti; per essi si rimanda alle rispettive informative. Fino a
          quando non avviene un vero e proprio embed, i link esterni non installano cookie
          di terze parti tramite questo sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Disabilitazione tramite browser
        </h2>
        <p>
          È possibile disabilitare i cookie direttamente dalle impostazioni del proprio
          browser. Istruzioni aggiornate sono disponibili sui siti ufficiali dei principali
          browser (Chrome, Firefox, Safari, Edge). La disabilitazione dei cookie tecnici
          essenziali o delle preferenze può influire sul corretto funzionamento di alcune
          parti del sito.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Contatti
        </h2>
        <p>
          Per domande sulla Cookie Policy o sulle modalità del consenso scrivi a:
        </p>
        <p>
          <a href={`mailto:${siteConfig.contactEmail}`} className="link-underline">
            {siteConfig.contactEmail}
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
