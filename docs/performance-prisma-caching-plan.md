# Piano a Step: Prisma, Data Layer e Caching

## Obiettivo

Ridurre il tempo di risposta delle pagine pubbliche e delle navigazioni admin senza rimuovere Prisma dalle Server Components dove e appropriato.

Prisma diretto nelle pagine non e un problema in se. Diventa un rischio quando query pubbliche, classifiche o calcoli aggregati vengono eseguiti a ogni request senza misurazione, cache o snapshot.

## Regole Guida

- Prisma diretto resta accettabile per pagine private/admin protette da auth.
- Le query pubbliche vanno progressivamente spostate in `lib/data/public/`.
- Non introdurre API route interne solo per chiamare Prisma.
- Non rimuovere `force-dynamic` dalle pagine DB se questo fa partire query Prisma durante `npm run build`.
- Cache solo per dati pubblici, non personalizzati.
- Ogni step deve chiudersi con `npx tsc --noEmit`, `npm test` e `npm run build`.

## Step 0: Baseline e Guardrail

### Obiettivo

Stabilire lo stato iniziale prima di cambiare query o caching.

### Azioni

- Confermare che il working tree sia pulito.
- Eseguire:

```bash
npx tsc --noEmit
npm test
npm run build
```

- Annotare eventuali warning noti, ad esempio fallback metadata PWA se mancano `NEXTAUTH_URL` o `NEXT_PUBLIC_APP_URL`.
- Non cambiare comportamento dominio in questo step.

### Output

- Baseline verificata.
- Eventuali problemi preesistenti documentati.

### Done

- Typecheck, test e build passano.
- Nessuna modifica applicativa non necessaria.

## Step 1: Misurazione Performance Server

### Obiettivo

Capire quali pagine/funzioni sono davvero lente prima di introdurre caching o snapshot.

### Azioni

- Creare un helper, ad esempio `lib/perf.ts`.
- Aggiungere una funzione tipo `measureServerTiming(label, fn)`.
- Loggare solo quando:
  - `process.env.PERF_LOG === "1"`;
  - oppure `process.env.NODE_ENV === "development"`.
- Usare una soglia iniziale, ad esempio `150ms`.
- Non loggare dati sensibili, email, nomi utenti completi o payload form.

### Punti da Strumentare

- `computeCumulativeRankings`
- `computeStandings`
- `buildGroupStandings`
- fetch dati di `/partite`
- fetch dati di `/gironi`
- fetch dati di `/classifica-fanta`
- fetch dati di `/squadre-fanta`
- fetch dati di `/giocatori`
- fetch dati GreenVolley

### File Probabili

- `lib/perf.ts`
- `lib/scoring.ts`
- `lib/standings.ts`
- pagine pubbliche sotto `app/(public)/`

### Done

- I log indicano durata e label della funzione lenta.
- Nessun dato sensibile nei log.
- Typecheck, test e build passano.

## Step 2: Estrarre il Data Layer Pubblico

### Obiettivo

Separare le query pubbliche dalla UI, senza cambiare caching.

### Azioni

- Creare `lib/data/public/`.
- Spostare una pagina alla volta in funzioni dati dedicate.
- Iniziare dalle pagine piu semplici:
  - bonus pubblici/segreti;
  - squadre;
  - classifica marcatori.
- Poi passare alle pagine piu complesse:
  - partite;
  - gironi;
  - classifica torneo;
  - classifica fanta;
  - GreenVolley.

### Struttura Suggerita

```text
lib/data/public/
  bonuses.ts
  teams.ts
  players.ts
  matches.ts
  standings.ts
  fantasy-rankings.ts
  volley.ts
```

### Regole per le Funzioni

- Usare `select` espliciti.
- Evitare `include` larghi quando non necessari.
- Restituire DTO pronti per la UI.
- Non leggere sessione, cookies o headers.
- Non contenere personalizzazione utente.

### Done

- Le pagine pubbliche importano funzioni da `lib/data/public/*`.
- La UI riceve dati gia normalizzati.
- Nessuna regressione funzionale.
- Typecheck, test e build passano.

## Step 3: Ridurre Query e Include Pesanti

### Obiettivo

Ridurre carico DB e serializzazione RSC prima di aggiungere cache.

### Azioni

- Cercare query Prisma con `include` profondi.
- Sostituire con `select` mirati.
- Evitare di passare oggetti Prisma completi ai componenti client.
- Precomputare DTO minimali server-side.
- Controllare se alcune query possono essere accorpate o eliminate.

### Indici da Valutare

- `matchId`
- `playerId`
- `footballTeamId`
- `fantasyTeamId`
- `status`
- `startsAt`
- relazioni many-to-many fantasy/player

### Done

- Le pagine pubbliche inviano meno dati alla UI.
- Nessun cambio alle regole di dominio.
- I log dello Step 1 mostrano miglioramento o almeno nessuna regressione.
- Typecheck, test e build passano.

## Step 4: Caching Dati Pubblici

### Obiettivo

Cache-are dati pubblici e non personalizzati senza rompere la build quando il DB non e disponibile.

### Decisione Tecnica

Prima di implementare, scegliere una strada:

- `use cache` con `cacheComponents` abilitato consapevolmente;
- oppure `unstable_cache` come step pragmatico, sapendo che Next 16 preferisce `use cache`.

Non togliere `force-dynamic` dalle pagine DB solo per ottenere ISR: questo puo far partire query Prisma durante `npm run build`.

### Candidati Cache

- bonus pubblici/segreti;
- lista squadre;
- lista giocatori;
- classifica marcatori;
- classifica torneo;
- partite pubbliche;
- standings GreenVolley.

### TTL Iniziali

- Dati live/classifiche: `30-60s`.
- Liste e bonus: `60-300s`.

### Invalidation

- Collegare le Server Actions admin alle invalidazioni.
- Riutilizzare o estendere `app/actions/admin/revalidate-public.ts`.
- Verificare che update admin rendano visibili i dati aggiornati.

### Done

- `npm run build` non richiede DB per prerenderizzare pagine DB.
- La cache viene invalidata dopo mutazioni admin rilevanti.
- Le pagine pubbliche restano corrette.
- Typecheck, test e build passano.

## Step 5: Snapshot Classifiche Fantasy

### Obiettivo

Evitare che `computeCumulativeRankings()` diventi il collo di bottiglia principale.

### Problema

`computeCumulativeRankings()` aggrega match, bonus, gol, MVP, rose e fasi. Con piu dati puo diventare costosa a ogni request.

### Azioni

- Valutare una tabella snapshot, ad esempio:
  - `FantasyRankingSnapshot`;
  - `FantasyTeamScoreSnapshot`;
  - snapshot per fase/punteggio totale.
- Definire quando aggiornare lo snapshot:
  - bonus assegnato/rimosso;
  - gol aggiunto/rimosso;
  - MVP override;
  - score partita;
  - fase punteggio;
  - modifica rosa fantasy;
  - cambio capitano.
- Mantenere un comando o funzione admin per ricalcolo completo.

### Done

- `/classifica-fanta` e `/squadre-fanta` leggono snapshot gia calcolati.
- Le mutazioni rilevanti aggiornano o invalidano snapshot.
- Il calcolo completo resta disponibile come fallback.
- Typecheck, test e build passano.

## Step 6: Navigazione Admin

### Obiettivo

Ridurre il tempo percepito quando si entra nei dettagli admin.

### Azioni

- Mantenere prefetch su righe cliccabili.
- Valutare conversione da `div onClick` a `Link` dove non esistono azioni annidate.
- Lasciare `div role="button"` quando dentro la riga ci sono form o bottoni di delete.
- Aggiungere loading specifici per detail page pesanti.
- Verificare navigazione tastiera.

### Done

- Click admin percepito piu rapido.
- Cancellazioni/form annidati non causano navigazioni involontarie.
- Navigazione tastiera preservata.
- Typecheck, test e build passano.

## Step 7: Verifica Runtime con DB Disponibile

### Obiettivo

Validare le modifiche in condizioni realistiche, non solo via build.

### Pagine da Aprire

- `/`
- `/partite`
- `/bonus-pubblici`
- `/classifica-fanta`
- `/squadre-fanta`
- `/admin/partite`
- dettaglio partita admin
- `/greenvolley`
- `/greenvolley/classifica`

### Controlli

- Le pagine non mostrano errori Prisma.
- I loading state non restano bloccati.
- Le navigazioni admin funzionano con click e tastiera.
- I dati pubblici si aggiornano dopo una modifica admin.
- Gli asset statici mantengono header cache corretti.

### Done

- Verifica manuale completata con DB disponibile.
- Nessun processo locale o file temporaneo rimasto aperto.
- Typecheck, test e build passano.

## Ordine Consigliato

1. Step 0: Baseline e guardrail.
2. Step 1: Misurazione.
3. Step 2: Data layer pubblico.
4. Step 3: Query/select/indici.
5. Step 4: Cache dati pubblici.
6. Step 5: Snapshot classifiche fantasy.
7. Step 6: Navigazione admin.
8. Step 7: Verifica runtime.

## Non Obiettivi

- Non introdurre API route interne solo per query Prisma.
- Non rendere statiche pagine DB se la build richiede database disponibile.
- Non cache-are dati utente o admin privati.
- Non cambiare regole di dominio o punteggio senza aggiornare `ai_context/`.
