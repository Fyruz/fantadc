export default function RegolamentoPage() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <div className="over-label mb-1">Stagione 2025</div>
        <h1 className="font-display font-black text-3xl uppercase" style={{ color: "var(--text-primary)" }}>
          REGOLAMENTO
        </h1>
      </div>

      <div className="card p-6 flex flex-col gap-6 text-sm" style={{ color: "var(--text-muted)" }}>
        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Come funziona il Fantadc
          </h2>
          <p>
            Il Fantadc è il gioco fantasy ufficiale del torneo di paese. Ogni partecipante crea la
            propria squadra fantasy scegliendo 5 giocatori reali del torneo e guadagna punti in base
            ai bonus assegnati dagli admin e al risultato del voto MVP.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            La rosa
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>La rosa è composta esattamente da <strong>5 giocatori</strong></li>
            <li>
              Obbligatoriamente: <strong>1 portiere</strong> e <strong>4 giocatori di movimento</strong>
            </li>
            <li>
              I 5 giocatori devono appartenere a <strong>5 squadre reali diverse</strong>
            </li>
            <li>La rosa è <strong>bloccata</strong> dopo la creazione e non è modificabile dall&apos;utente</li>
            <li>
              Ogni squadra deve avere un <strong>capitano</strong>, che deve far parte della rosa
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Il capitano
          </h2>
          <p>
            Il capitano <strong>raddoppia il proprio punteggio</strong> in ogni partita. Se un
            giocatore capitano segna 3 punti in bonus, il contributo alla squadra sarà 6 punti.
            Scegli con attenzione!
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            I punti
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>I punti derivano dai <strong>bonus e malus</strong> assegnati dagli admin dopo ogni partita</li>
            <li>Gol, assist, ammonizioni e altri eventi vengono premiati o penalizzati</li>
            <li>Il giocatore eletto <strong>MVP della partita</strong> riceve punti extra</li>
            <li>
              Il punteggio della squadra è la <strong>somma dei 5 giocatori</strong> della rosa
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Il voto MVP
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Dopo ogni partita si apre una <strong>finestra di voto</strong> di 1 ora
            </li>
            <li>Ogni utente registrato può votare <strong>una sola volta</strong> per partita</li>
            <li>Il giocatore più votato diventa il <strong>MVP della partita</strong> e guadagna punti bonus</li>
            <li>Durante la finestra di voto è visibile il favorito provvisorio</li>
            <li>Il voto non è modificabile dopo l&apos;invio</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            La classifica
          </h2>
          <p>
            La classifica è <strong>cumulata</strong>: si sommano i punti di tutte le partite
            pubblicate. Non esiste il concetto di giornata. Vince chi ha più punti a fine torneo.
            In caso di parità, la posizione è determinata in ordine alfabetico.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
            Come partecipare
          </h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Registrati con la tua email</li>
            <li>Crea la tua squadra fantasy scegliendo 5 giocatori e il capitano</li>
            <li>Segui le partite del torneo e vota l&apos;MVP dopo ogni incontro</li>
            <li>Scala la classifica e batti i tuoi avversari!</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
