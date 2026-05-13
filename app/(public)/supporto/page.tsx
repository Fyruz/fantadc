import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supporto app",
  description: "Pagina di supporto ufficiale di Fantadc per utenti web e App Store.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <div className="over-label mb-1">Fantadc</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          SUPPORTO APP
        </h1>
      </div>

      <div className="card p-6 flex flex-col gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <p>
          Ultimo aggiornamento: <strong>13 maggio 2026</strong>
        </p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Come ricevere assistenza
          </h2>
          <p>
            Per problemi di accesso, malfunzionamenti, segnalazioni o richieste di supporto,
            contatta l&apos;organizzatore dalla pagina{" "}
            <Link href="/contatti" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
              Contatti
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Problemi più comuni
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Non riesco ad accedere all&apos;account.</li>
            <li>La mia squadra fantasy non è visibile o non è aggiornata.</li>
            <li>Non riesco a votare l&apos;MVP entro la finestra disponibile.</li>
            <li>Notifiche push non ricevute su dispositivo.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Richieste privacy e dati
          </h2>
          <p>
            Per richieste relative a privacy, cancellazione account o diritti sui dati personali,
            consulta anche la policy dedicata.
          </p>
          <p className="mt-2">
            <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
              Vai alla Privacy Policy
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
