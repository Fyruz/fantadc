import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Contatti ufficiali organizzatori e sviluppatori di Fantadc.",
};

export default function ContattiPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <div className="over-label mb-1">Fantadc</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          CONTATTI
        </h1>
      </div>

      <div className="card p-6 flex flex-col gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <p>
          Ultimo aggiornamento: <strong>13 maggio 2026</strong>
        </p>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Organizzatori
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Danimarca&apos;s Cup:{" "}
              <a
                href="https://www.instagram.com/danimarcas_cup/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                instagram.com/danimarcas_cup
              </a>
            </li>
            <li>
              Nuova Polisportiva Chianti:{" "}
              <a
                href="https://www.instagram.com/nuovapolisportivachianti/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                instagram.com/nuovapolisportivachianti
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Sviluppatori
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Gianmarco Ferruzzi, Qursor</li>
            <li>
              Sito web:{" "}
              <a
                href="https://qursor.it/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                qursor.it
              </a>
            </li>
            <li>
              Email:{" "}
              <a
                href="mailto:info@qursor.it"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                info@qursor.it
              </a>
            </li>
          </ul>
          <p
            className="mt-4 rounded-xl px-4 py-3 font-display font-black text-lg uppercase"
            style={{ color: "var(--text-primary)", background: "var(--surface-1)", border: "1px solid var(--border-medium)" }}
          >
            Ti serve una applicazione? Contattaci: siamo aperti a sviluppare nuovi progetti.
          </p>
        </section>
      </div>
    </div>
  );
}
