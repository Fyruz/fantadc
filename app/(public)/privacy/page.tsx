import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Norme sulla privacy",
  description: "Informativa privacy di Fantadc per utenti web e app pubblicata su Google Play Console.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <div className="over-label mb-1">Fantadc</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          NORME SULLA PRIVACY
        </h1>
      </div>

      <div className="card p-6 flex flex-col gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <p>
          Ultimo aggiornamento: <strong>11 maggio 2026</strong>
        </p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Titolare del trattamento
          </h2>
          <p>
            Il titolare del trattamento dei dati personali è l&apos;organizzatore del torneo Fantadc.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Dati raccolti
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Dati account</strong>: email e nome visualizzato (se inserito).
            </li>
            <li>
              <strong>Dati di gioco</strong>: squadra fantasy, capitano, voti MVP, punteggi e classifica.
            </li>
            <li>
              <strong>Dati tecnici dispositivo/browser</strong>: log tecnici di sicurezza e sessione, inclusi IP e user-agent.
            </li>
            <li>
              <strong>Dati notifiche push</strong>: endpoint e chiavi tecniche del browser/dispositivo, solo con consenso esplicito.
            </li>
          </ul>
          <p className="mt-2">
            Fantadc <strong>non</strong> accede a rubrica, foto, audio, posizione GPS o dati sanitari del dispositivo.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Finalità del trattamento
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Consentire registrazione, login e uso del servizio Fantadc.</li>
            <li>Gestire il torneo fantasy, le votazioni MVP e la classifica.</li>
            <li>Inviare notifiche push legate al gioco (es. apertura voto MVP), solo se abilitate.</li>
            <li>Proteggere piattaforma e utenti da abusi tecnici e uso improprio.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Base giuridica
          </h2>
          <p>
            Trattiamo i dati per esecuzione del servizio richiesto dall&apos;utente e, dove necessario,
            sulla base del consenso (es. notifiche push).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Condivisione dei dati
          </h2>
          <p>
            I dati non sono venduti né ceduti per finalità pubblicitarie. Possono essere trattati da fornitori
            tecnici strettamente necessari al funzionamento del servizio (hosting, database, infrastruttura push).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Visibilità pubblica dei contenuti
          </h2>
          <p>Sono pubblici: nome squadra fantasy, composizione, punteggio e posizione in classifica.</p>
          <p className="mt-2">Email, dati di accesso e voto MVP del singolo utente non sono pubblici.</p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Conservazione
          </h2>
          <p>
            I dati sono conservati per la durata del torneo e per il periodo tecnico-amministrativo necessario
            alla gestione del servizio e alla sicurezza.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Diritti dell&apos;utente
          </h2>
          <p className="mb-1">Ai sensi del GDPR puoi richiedere accesso, rettifica, cancellazione e limitazione del trattamento.</p>
          <p>
            Puoi inoltre revocare in ogni momento il consenso alle notifiche push dalle impostazioni del tuo browser/dispositivo.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Contatti privacy
          </h2>
          <p>
            Per richieste privacy o cancellazione account contatta l&apos;organizzatore del torneo tramite i canali ufficiali Fantadc.
          </p>
        </section>
      </div>
    </div>
  );
}
