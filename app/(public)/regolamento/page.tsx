import Link from "next/link";

export default function RegolamentoPage() {
  return (
    <div className="flex flex-col gap-10 max-w-2xl">
      <div className="md:hidden flex items-center justify-between h-12">
        <div className="flex-1 flex items-center">
          <Link href="/altro" className="flex items-center justify-center w-6 h-6">
            <img src="/icons/chevron_left.svg" width={24} height={24} alt="Indietro" />
          </Link>
        </div>
        <span className="flex-1 text-center uppercase" style={{ fontFamily: "var(--font-tallica)", fontSize: 20, color: "#09144C" }}>
          Regolamento
        </span>
        <div className="flex-1" />
      </div>

      <div className="flex flex-col gap-10">
        {[
          {
            title: "Come funziona il Fantadc",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Il Fantadc è un gioco di fantacalcio. Ogni partecipante crea la
                propria squadra fanta scegliendo 5 giocatori reali e guadagna punti in base
                ai bonus assegnati dagli admin e al risultato del voto MVP.
              </p>
            ),
          },
          {
            title: "La rosa",
            content: (
              <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                <li>La rosa è composta esattamente da <strong>5 giocatori</strong></li>
                <li>Obbligatoriamente: <strong>1 portiere</strong> e <strong>4 giocatori di movimento</strong></li>
                <li>I 5 giocatori devono appartenere a <strong>5 squadre reali diverse</strong></li>
                <li>La rosa è <strong>bloccata</strong> dopo la creazione e non è modificabile dall&apos;utente</li>
                <li>Ogni squadra deve avere un <strong>capitano</strong>, che deve far parte della rosa</li>
              </ul>
            ),
          },
          {
            title: "Il capitano",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                Il capitano <strong>raddoppia il proprio punteggio</strong> in ogni partita. Se un
                giocatore capitano segna 3 punti in bonus, il contributo alla squadra sarà 6 punti.
                Scegli con attenzione!
              </p>
            ),
          },
          {
            title: "I punti",
            content: (
              <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                <li>I punti derivano dai <strong>bonus e malus</strong> assegnati dagli admin dopo ogni partita</li>
                <li>Gol, assist, ammonizioni e altri eventi vengono premiati o penalizzati</li>
                <li>Il giocatore eletto <strong>MVP della partita</strong> riceve <strong>5 punti</strong></li>
                <li>Il punteggio della squadra è la <strong>somma dei 5 giocatori</strong> della rosa</li>
              </ul>
            ),
          },
          {
            title: "Il voto MVP",
            content: (
              <ul className="text-base leading-relaxed space-y-1.5" style={{ color: "#000" }}>
                <li>Dopo ogni partita si apre una <strong>finestra di voto</strong> di 2 ore</li>
                <li>Ogni utente registrato può votare <strong>una sola volta</strong> per partita</li>
                <li>Il giocatore più votato diventa il <strong>MVP della partita</strong> e guadagna <strong>5 punti</strong></li>
                <li>Durante la finestra di voto è visibile il favorito provvisorio</li>
                <li>Il voto non è modificabile dopo l&apos;invio</li>
              </ul>
            ),
          },
          {
            title: "La classifica",
            content: (
              <p className="text-base leading-relaxed" style={{ color: "#000" }}>
                La classifica è <strong>cumulata</strong>: si sommano i punti di tutte le partite
                pubblicate. Non esiste il concetto di giornata. Vince chi ha più punti a fine torneo.
                In caso di parità, la posizione è determinata in ordine alfabetico.
              </p>
            ),
          },
          {
            title: "Come partecipare",
            content: (
              <ol className="text-base leading-relaxed space-y-1.5 list-decimal list-inside" style={{ color: "#000" }}>
                <li>Registrati con la tua email</li>
                <li>Crea la tua squadra fantasy scegliendo 5 giocatori e il capitano</li>
                <li>Segui le partite del torneo e vota l&apos;MVP dopo ogni incontro</li>
                <li>Scala la classifica e batti i tuoi avversari!</li>
              </ol>
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

      <p className="text-center text-xs" style={{ color: "#000" }}>
        <Link href="/supporto" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
          Supporto app
        </Link>
        <span className="px-2">·</span>
        <Link href="/privacy" className="underline underline-offset-2 hover:opacity-70 transition-opacity">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
