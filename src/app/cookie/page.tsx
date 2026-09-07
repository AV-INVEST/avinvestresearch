import LegalLayout from '@/components/legal/LegalLayout';
import type { Metadata } from 'next';
import { siteConfig } from '@/config/siteConfig';
import { cookieCategories, cookieTable } from '@/config/cookieConfig';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description:
    'Informativa sui cookie e sulle tecnologie simili utilizzati su avinvestresearch.com, con tabella dei cookie e strumenti effettivamente impiegati.',
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
          1. Cosa sono i cookie e tecnologie simili
        </h2>
        <p>
          I cookie sono piccoli file di testo inviati dal Sito al dispositivo
          dell&apos;utente (computer, tablet, smartphone) e memorizzati sul
          browser o sullo storage locale del dispositivo, al fine di migliorare
          l&apos;esperienza di navigazione, ricordare preferenze, analizzare il
          traffico e, solo previo consenso, supportare funzionalit&agrave;
          aggiuntive o di marketing.
        </p>
        <p className="mt-2">
          Insieme ai cookie, il Sito pu&ograve; utilizzare anche tecnologie
          simili quali localStorage, sessionStorage o identificatori di
          sessione su storage di primo partito, che hanno finalit&agrave;
          analoghe e sono disciplinati dalla presente informativa.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          2. Base giuridica
        </h2>
        <p>
          L&apos;installazione dei cookie sul dispositivo dell&apos;utente si
          basa su due distinte basi giuridiche, nel rispetto delle
          &quot;Linee guida cookie e altri strumenti di tracciamento&quot;
          del Garante per la Protezione dei Dati Personali del 10 giugno 2021
          e del GDPR:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Cookie tecnici necessari</strong>:
            il loro trattamento &egrave; basato sul legittimo interesse del
            Titolare a garantire il corretto funzionamento, la sicurezza e
            l&apos;usabilit&agrave; del Sito (art. 6.1.f GDPR). Non
            richiedono consenso preventivo ai sensi della normativa vigente
            e non possono essere disattivati tramite le impostazioni del
            cookie manager (fatto salvo quanto previsto dal singolo browser,
            di cui al paragrafo 7).
          </li>
          <li>
            <strong className="text-white">Cookie di preferenze, analitici e marketing</strong>:
            sono installati sul dispositivo dell&apos;utente solo dopo
            l&apos;espressione di un consenso libero, specifico, informato e
            revocabile, tramite le opzioni del banner di primo accesso o
            del pannello di gestione (art. 6.1.a GDPR e normativa vigente in
            materia di cookie).
          </li>
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          3. Categorie di cookie previste
        </h2>
        <p>
          Il Sito distingue le seguenti categorie di cookie o strumenti
          analoghi. Ogni categoria pu&ograve; essere gestita separatamente
          tramite il pannello &quot;Gestisci cookie&quot; nel footer, salvo
          la categoria dei tecnici necessari:
        </p>
        <ul className="mt-3 space-y-3 pl-5 marker:text-av-green [list-style:disc]">
          {cookieCategories.map((c) => (
            <li key={c.id}>
              <strong className="text-white">{c.label}:</strong> {c.description}
              {c.alwaysActive ? (
                <span className="ml-2 text-xs text-av-green">
                  Sempre attivi - non richiedono consenso.
                </span>
              ) : (
                <span className="ml-2 text-xs text-av-muted">
                  Installati solo previo consenso esplicito e specifico
                  dell&apos;utente tramite il gestore dei preferenze.
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          4. Cookie e tecnologie effettivamente presenti sul Sito
        </h2>
        <p>
          In occasione dell&apos;ultimo aggiornamento della presente Cookie
          Policy, le voci effettivamente configurate nell&apos;implementazione
          tecnica del Sito sono quelle riportate nella tabella seguente,
          ricavata direttamente dalle impostazioni del gestore dei consensi:
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-av-line text-left text-xs uppercase tracking-[0.14em] text-av-green">
                <th className="p-3 font-semibold">Nome</th>
                <th className="p-3 font-semibold">Tipo / Strumento</th>
                <th className="p-3 font-semibold">Categoria</th>
                <th className="p-3 font-semibold">Durata</th>
                <th className="p-3 font-semibold">Finalit&agrave;</th>
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
        <p className="mt-3 text-xs text-av-muted sm:text-sm">
          Eventuali nuove categorie o nuovi strumenti saranno aggiunti alla
          tabella solo a partire dalla data della loro effettiva attivazione
          sul Sito e, ove necessitino di consenso, dopo l&apos;adeguamento
          del meccanismo di raccolta consenso secondo la normativa vigente.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          5. Gestione del consenso sul Sito
        </h2>
        <p>
          Al primo accesso, o quando il consenso memorizzato non &egrave; pi&ugrave;
          valido (es. dopo modifiche sostanziali alla presente policy, dopo
          aggiornamenti importanti, o a seguito della scadenza naturale del
          consenso), viene mostrato un pannello dedicato tramite cui l&apos;utente
          pu&ograve;:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            Accettare tutte le categorie non necessarie in blocco.
          </li>
          <li>
            Rifiutare tutte le categorie non necessarie in blocco.
          </li>
          <li>
            Personalizzare le preferenze, accettando o rifiutando le singole
            categorie una ad una tramite l&apos;apposita sezione.
          </li>
        </ul>
        <p className="mt-3">
          Le preferenze cos&igrave; espresse sono memorizzate localmente sul
          dispositivo utente nello storage di primo partito (con la voce
          <span className="mx-1 font-mono text-xs text-white">av-consent</span>)
          e hanno validit&agrave; di 12 mesi, salvo revoca o modifica anticipata.
          Le preferenze possono essere modificate in qualsiasi momento dalla
          voce &quot;Gestisci cookie&quot; presente nel footer del Sito, che
          riapre il pannello di gestione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          6. Link esterni e servizi di terze parti
        </h2>
        <p>
          Il Sito pu&ograve; contenere link esterni verso siti o strumenti di
          terze parti, tra cui in particolare:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <strong className="text-white">Calendly</strong>: per la prenotazione
            di call informative, tramite link testuale verso calendly.com.
          </li>
          <li>
            <strong className="text-white">Stripe</strong>: per pagamenti,
            gestione abbonamenti e Customer Portal.
          </li>
          <li>
            <strong className="text-white">Profilo LinkedIn e Instagram</strong>
            : link verso i canali social ufficiali del Titolare.
          </li>
          <li>
            <strong className="text-white">Google (Auth)</strong>: per la
            procedura di login all&apos;area membri tramite account Google.
          </li>
        </ul>
        <p className="mt-2">
          Fino a quando non avviene un vero e proprio embed diretto sul Sito,
          il semplice click su un link esterno non installa automaticamente
          cookie di terze parti tramite questo Sito; una volta raggiunto il
          sito di destinazione, invece, la gestione dei cookie e delle
          tecnologie di tracciamento ricade sotto la responsabilit&agrave; e
          l&apos;informativa del rispettivo titolare autonomo. Si rimanda
          quindi alle informative cookie e privacy dei singoli siti terzi per
          ogni dettaglio.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          7. Disabilitazione dei cookie tramite impostazioni del browser
        </h2>
        <p>
          &Egrave; possibile disabilitare, bloccare o cancellare i cookie e
          gli elementi di storage locale direttamente dalle impostazioni del
          proprio browser o del proprio dispositivo. Istruzioni aggiornate
          sono disponibili sui siti ufficiali dei principali browser:
        </p>
        <ul className="mt-2 space-y-2 pl-5 marker:text-av-green [list-style:disc]">
          <li>
            <a href="https://support.google.com/chrome/answer/95647?hl=it" target="_blank" rel="noopener noreferrer" className="link-underline">
              Google Chrome
            </a>
          </li>
          <li>
            <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noopener noreferrer" className="link-underline">
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="link-underline">
              Apple Safari
            </a>
          </li>
          <li>
            <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="link-underline">
              Microsoft Edge
            </a>
          </li>
        </ul>
        <p className="mt-2">
          Si segnala che la disabilitazione dei cookie tecnici necessari o
          delle preferenze pu&ograve; compromettere o alterare il corretto
          funzionamento di alcune parti del Sito, inclusa la persistenza
          delle preferenze sul consenso cookie o alcuni stati di sessione.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          8. Modifiche alla Cookie Policy
        </h2>
        <p>
          Il Titolare si riserva il diritto di modificare la presente Cookie
          Policy in qualsiasi momento, anche in seguito a variazioni normative
          o all&apos;introduzione di nuove categorie di cookie o strumenti di
          tracciamento. In caso di modifiche sostanziali che introducono nuove
          categorie di cookie non necessari, sar&agrave; richiesto nuovamente
          il consenso dell&apos;utente secondo le modalit&agrave; di legge.
        </p>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">
          9. Contatti
        </h2>
        <p>
          Per domande sulla Cookie Policy, sulle modalit&agrave; del consenso
          o per segnalazioni relative all&apos;utilizzo dei cookie sul Sito:
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
