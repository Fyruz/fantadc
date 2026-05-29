import type { Metadata } from "next";
import Image from "next/image";

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
            <li>
              GreenVolley Cup:{" "}
              <a
                href="https://www.instagram.com/greenvolley_cup/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                instagram.com/greenvolley_cup
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
              Instagram:{" "}
              <a
                href="https://www.instagram.com/gianmarcoferruzzi/"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:opacity-70 transition-opacity"
              >
                instagram.com/gianmarcoferruzzi
              </a>
            </li>
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
          <div
            className="mt-4 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0107A3 0%, #000669 100%)",
              boxShadow: "0 4px 24px rgba(1,7,163,0.25)",
            }}
          >
            <div className="px-5 py-5 flex flex-col gap-4">
              {/* Icon + headline */}
              <div className="flex items-start gap-3">
                <Image
                  src="/logo_qursor.png"
                  alt="Qursor"
                  width={40}
                  height={40}
                  className="rounded-xl shrink-0"
                />
                <div>
                  <div className="text-[11px] font-black uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Qursor
                  </div>
                  <div className="font-display font-black text-xl uppercase leading-tight text-white">
                    Hai un&apos;idea?<br />Costruiamola insieme.
                  </div>
                </div>
              </div>

              {/* Body */}
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Siamo aperti a sviluppare nuovi progetti web e app. Se hai un&apos;idea o hai bisogno di un&apos;applicazione su misura, scrivici.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-2">
                <a
                  href="mailto:info@qursor.it"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: "#fff", color: "var(--primary)" }}
                >
                  <i className="pi pi-envelope text-xs" />
                  info@qursor.it
                </a>
                <a
                  href="https://qursor.it/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <i className="pi pi-external-link text-xs" />
                  qursor.it
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
