export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <div className="over-label mb-1">Fantadc</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          PRIVACY POLICY
        </h1>
      </div>

      <div className="card p-6 flex flex-col gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <p>
          Ultimo aggiornamento: <strong>aprile 2026</strong>
        </p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Titolare del trattamento
          </h2>
          <p>
            Il titolare del trattamento dei dati personali è l'organizzatore del torneo Fantadc.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Quali dati raccogliamo
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Indirizzo email</strong> — fornito al momento della registrazione, usato come
              identificativo univoco per accedere alla piattaforma
            </li>
            <li>
              <strong>Nome visualizzato</strong> — facoltativo, inseribile in fase di registrazione
            </li>
            <li>
              <strong>Dati della squadra fantasy</strong> — nome della squadra, giocatori scelti e
              capitano selezionato
            </li>
            <li>
              <strong>Voti MVP</strong> — il voto espresso dopo ogni partita; i singoli voti sono
              privati e non associati pubblicamente all'utente
            </li>
            <li>
              <strong>Token per notifiche push</strong> — solo se accetti esplicitamente le notifiche
              dal browser; utilizzato esclusivamente per inviarti avvisi sull'apertura del voto MVP
            </li>
            <li>
              <strong>Log di attività admin</strong> — solo per gli account con ruolo amministratore,
              vengono registrate le azioni compiute a fini di audit interno
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Perché trattiamo i tuoi dati
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Gestire la tua partecipazione al gioco: registrazione, squadra fantasy, voti e classifica
            </li>
            <li>
              Inviarti notifiche push sull'apertura delle finestre di voto (solo con tuo consenso
              esplicito)
            </li>
            <li>
              Garantire la sicurezza della piattaforma e prevenire usi impropri
            </li>
          </ul>
          <p className="mt-2">
            Base giuridica: <strong>esecuzione di un contratto</strong> (la tua partecipazione
            volontaria al torneo) e <strong>consenso</strong> per le notifiche push.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Come utilizziamo i tuoi dati
          </h2>
          <p>
            I dati sono utilizzati esclusivamente per la gestione del Fantadc. Non vendiamo,
            cediamo né condividiamo le tue informazioni con terze parti a fini commerciali.
            I dati non vengono usati per profilazione, pubblicità o analisi di marketing.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Visibilità pubblica
          </h2>
          <p>
            Alcune informazioni sono visibili pubblicamente senza autenticazione:
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Il nome della tua squadra fantasy e la sua composizione (giocatori e capitano)</li>
            <li>Il punteggio della tua squadra e la posizione in classifica</li>
          </ul>
          <p className="mt-2">
            Il tuo indirizzo email e il tuo voto MVP non sono mai visibili pubblicamente.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Conservazione dei dati
          </h2>
          <p>
            I tuoi dati vengono conservati per la durata del torneo e per un ragionevole
            periodo successivo necessario alla gestione amministrativa. Al termine del torneo
            puoi richiedere la cancellazione del tuo account contattando l'organizzatore.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            I tuoi diritti (GDPR)
          </h2>
          <p className="mb-1">
            In base al Regolamento UE 2016/679 (GDPR) hai il diritto di:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>Accesso</strong> — sapere quali dati conserviamo su di te</li>
            <li><strong>Rettifica</strong> — correggere dati inesatti</li>
            <li><strong>Cancellazione</strong> — richiedere la rimozione del tuo account e dei dati associati</li>
            <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato leggibile</li>
            <li><strong>Opposizione</strong> — opporti al trattamento in determinate circostanze</li>
            <li>
              <strong>Revoca del consenso</strong> — disattivare le notifiche push in qualsiasi momento
              dalle impostazioni del browser
            </li>
          </ul>
          <p className="mt-2">
            Per esercitare questi diritti contatta l'organizzatore del torneo. Hai inoltre il
            diritto di presentare reclamo all'<strong>Autorità Garante per la Protezione dei
            Dati Personali</strong> (www.garanteprivacy.it).
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Cookie e archiviazione locale
          </h2>
          <p>
            Il sito utilizza un <strong>cookie di sessione</strong> necessario al funzionamento
            dell'autenticazione. Non vengono usati cookie di tracciamento o di terze parti.
            Non viene utilizzato Google Analytics né alcun altro strumento di analisi esterno.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Aggiornamenti
          </h2>
          <p>
            Questa informativa può essere aggiornata nel corso del torneo. Le modifiche
            sostanziali verranno comunicate agli utenti registrati.
          </p>
        </section>
      </div>
    </div>
  );
}
