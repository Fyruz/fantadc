import BackButton from "@/components/back-button";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Supporto app",
  description: "Pagina di supporto ufficiale di Fantadc per utenti web e App Store.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <BackButton />
        </div>
        <span className="flex-1 text-center uppercase" style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "#09144C" }}>
          Supporto
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col gap-10">
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Ultimo aggiornamento: <strong>13 maggio 2026</strong>
        </p>

        {[
          {
            title: "Come ricevere assistenza",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Per problemi di accesso, malfunzionamenti, segnalazioni o richieste di supporto,
                contatta l&apos;organizzatore dalla pagina{" "}
                <Link href="/contatti" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
                  Contatti
                </Link>
                .
              </p>
            ),
          },
          {
            title: "Problemi più comuni",
            content: (
              <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                <li>Non riesco ad accedere all&apos;account.</li>
                <li>La mia squadra fantasy non è visibile o non è aggiornata.</li>
                <li>Non riesco a votare l&apos;MVP entro la finestra disponibile.</li>
                <li>Avvisi non ricevuti su dispositivo.</li>
              </ul>
            ),
          },
          {
            title: "Richieste privacy e dati",
            content: (
              <div className="flex flex-col gap-2">
                <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                  Per richieste relative a privacy, cancellazione account o diritti sui dati personali,
                  consulta anche la policy dedicata.
                </p>
                <Link href="/privacy" className="text-base underline underline-offset-2 hover:opacity-70 transition-opacity" style={{ color: "var(--primary)" }}>
                  Vai alla Privacy Policy
                </Link>
              </div>
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
