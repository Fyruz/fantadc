import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Norme sulla privacy",
  description: "Informativa privacy di Fantadc per utenti web e app pubblicata su Google Play Console.",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <Link href="/altro" className="flex items-center justify-center w-6 h-6">
            <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
          </Link>
        </div>
        <span className="flex-1 text-center uppercase" style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "#09144C" }}>
          Privacy
        </span>
        <div className="flex-1" />
      </div>

      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
        Ultimo aggiornamento: <strong>11 maggio 2026</strong>
      </p>

      <div className="flex flex-col gap-10">
        {[
          {
            title: "Titolare del trattamento",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Il titolare del trattamento dei dati personali è lo sviluppatore dell&apos;applicazione, Qursor.
              </p>
            ),
          },
          {
            title: "Dati raccolti",
            content: (
              <div className="flex flex-col gap-3">
                <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                  <li><strong>Dati account</strong>: email e nome visualizzato (se inserito).</li>
                  <li><strong>Dati di gioco</strong>: squadra fantasy, capitano, voti MVP, punteggi e classifica.</li>
                </ul>
                <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                  Fantadc <strong>non</strong> accede a rubrica, foto, audio, posizione GPS o dati sanitari del dispositivo.
                </p>
              </div>
            ),
          },
          {
            title: "Finalità del trattamento",
            content: (
              <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                <li>Consentire registrazione, login e uso del servizio Fantadc.</li>
                <li>Gestire il torneo fantasy, le votazioni MVP e la classifica.</li>
                <li>Inviare comunicazioni legate al gioco e agli aggiornamenti del torneo.</li>
                <li>Proteggere piattaforma e utenti da abusi tecnici e uso improprio.</li>
              </ul>
            ),
          },
          {
            title: "Base giuridica",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Trattiamo i dati per esecuzione del servizio richiesto dall&apos;utente e, dove necessario, sulla base del consenso.
              </p>
            ),
          },
          {
            title: "Condivisione dei dati",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                I dati non sono venduti né ceduti per finalità pubblicitarie. Possono essere trattati da fornitori
                tecnici strettamente necessari al funzionamento del servizio (hosting e database).
              </p>
            ),
          },
          {
            title: "Visibilità pubblica dei contenuti",
            content: (
              <div className="flex flex-col gap-2">
                <p className="text-base leading-relaxed" style={{ color: "#000" }}>Sono pubblici: nome squadra fantasy, composizione, punteggio e posizione in classifica.</p>
                <p className="text-base leading-relaxed" style={{ color: "#000" }}>Email, dati di accesso e voto MVP del singolo utente non sono pubblici.</p>
              </div>
            ),
          },
          {
            title: "Conservazione",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                I dati sono conservati per la durata del torneo e per il periodo tecnico-amministrativo necessario
                alla gestione del servizio e alla sicurezza.
              </p>
            ),
          },
          {
            title: "Diritti dell'utente",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Ai sensi del GDPR puoi richiedere accesso, rettifica, cancellazione e limitazione del trattamento.
              </p>
            ),
          },
          {
            title: "Contatti privacy",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Per richieste privacy o cancellazione account contatta l&apos;organizzatore del torneo tramite i canali ufficiali Fantadc.
              </p>
            ),
          },
        ].map((s) => (
          <div key={s.title}>
            <h2
              className="text-base uppercase font-medium mb-3"
              style={{ fontFamily: "var(--font-tallica)", color: "var(--text-primary)", wordSpacing: "0.3em" }}
            >
              {s.title}
            </h2>
            {s.content}
          </div>
        ))}
      </div>
    </div>
  );
}
