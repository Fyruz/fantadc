# Piano Performance: Data Layer, Caching e Query Prisma

## Obiettivo

Ridurre il tempo di risposta delle pagine pubbliche e delle navigazioni admin senza rimuovere Prisma dalle Server Components dove e appropriato.

Prisma diretto nelle pagine non e vietato, ma va isolato, misurato e cache-ato dove i dati sono pubblici o costosi da calcolare.

## Principi

- Mantenere Prisma diretto per pagine private/admin protette da auth.
- Spostare le query pubbliche in funzioni dedicate sotto `lib/data/`.
- Evitare API route interne solo per chiamare Prisma.
- Non rimuovere `force-dynamic` dalle pagine DB finche il modello cache non evita il prerender build-time.
- Usare cache solo per dati pubblici, non personalizzati.
- Invalidare cache/revalidation dalle Server Actions admin.

## Fase 1: Misurazione

### Task

- Aggiungere un helper di timing server-side, ad esempio `lib/perf.ts`.
- Misurare:
  - tempo totale delle funzioni dati pubbliche;
  - funzioni lente sopra soglia, ad esempio `150ms`;
  - funzioni critiche come ranking fantasy, standings, partite pubbliche.
- Loggare solo in development o dietro env flag, ad esempio `PERF_LOG=1`.

### Pagine e funzioni da misurare

- `/partite`
- `/gironi`
- `/classifica-torneo`
- `/classifica-marcatori`
- `/classifica-fanta`
- `/squadre-fanta`
- `/giocatori`
- `/giocatori-fanta`
- `/greenvolley/*`
- `computeCumulativeRankings`
- `computeStandings`
- `buildGroupStandings`

### Acceptance Criteria

- Si vede nei log quali funzioni superano la soglia.
- Nessun dato sensibile viene loggato.
- `npx tsc --noEmit`, `npm test`, `npm run build` passano.

## Fase 2: Data Layer Pubblico

### Task

Creare funzioni dedicate in `lib/data/public/`, ad esempio:

- `lib/data/public/matches.ts`
- `lib/data/public/teams.ts`
- `lib/data/public/players.ts`
- `lib/data/public/standings.ts`
- `lib/data/public/fantasy-rankings.ts`
- `lib/data/public/volley.ts`
- `lib/data/public/bonuses.ts`

Ogni funzione deve:

- usare `select` espliciti;
- evitare `include` larghi quando non necessari;
- restituire DTO gia pronti per la UI;
- non leggere sessione, cookies o headers;
- non contenere logica utente-personalizzata.

### Acceptance Criteria

- Le pagine pubbliche importano funzioni da `lib/data/public/*`.
- La UI riceve dati gia normalizzati.
- Nessuna regressione visuale o funzionale.

## Fase 3: Caching Server per Dati Pubblici

### Task

- Valutare il modello corretto Next 16:
  - `use cache` solo se `cacheComponents` viene abilitato consapevolmente;
  - oppure `unstable_cache` come step pragmatico, sapendo che Next 16 preferisce `use cache`.
- Applicare cache solo a funzioni pubbliche non personalizzate.
- Usare TTL brevi:
  - classifiche/live data: `30-60s`;
  - bonus e liste squadre/giocatori: `60-300s`.

### Dati candidati

- bonus pubblici/segreti;
- lista squadre;
- lista giocatori;
- classifica marcatori;
- classifica torneo;
- partite pubbliche;
- GreenVolley standings.

### Acceptance Criteria

- Build non tenta query Prisma a build-time quando il DB non e disponibile.
- Le pagine restano corrette dopo aggiornamenti admin.
- Cache invalidata dalle action esistenti.

## Fase 4: Materializzazione Classifiche Fantasy

### Problema

`computeCumulativeRankings()` puo diventare costosa perche aggrega match, bonus, gol, MVP, rose e fasi.

### Task

Valutare una tabella snapshot, ad esempio:

- `FantasyRankingSnapshot`
- `FantasyTeamScoreSnapshot`
- oppure snapshot per fase/punteggio totale.

Aggiornare lo snapshot quando cambiano:

- bonus;
- gol;
- MVP;
- score partita;
- fase punteggio;
- rosa fantasy;
- capitano.

### Acceptance Criteria

- `/classifica-fanta` e `/squadre-fanta` leggono snapshot gia calcolati.
- Le Server Actions che cambiano punteggi aggiornano o invalidano snapshot.
- Il calcolo completo rimane disponibile come fallback o comando admin.

## Fase 5: Ottimizzazione Query

### Task

- Controllare query Prisma con `include` profondi.
- Sostituire con `select` mirati.
- Aggiungere indici Prisma/DB dove servono.
- Verificare query frequenti su:
  - `matchId`
  - `playerId`
  - `footballTeamId`
  - `fantasyTeamId`
  - `status`
  - `startsAt`
  - relazioni many-to-many fantasy/player.

### Acceptance Criteria

- Le query piu lente hanno piano/indice migliorato.
- Nessun cambio di comportamento dominio.
- Miglioramento misurabile nei log performance.

## Fase 6: Navigazione Admin

### Task

- Mantenere prefetch sulle righe cliccabili.
- Valutare conversione da `div onClick` a `Link` dove non ci sono azioni annidate.
- Aggiungere loading specifici per detail page pesanti se necessario.

### Acceptance Criteria

- Click admin percepito piu rapido.
- Cancellazioni/form annidati non causano navigazioni involontarie.
- Navigazione tastiera preservata.

## Verifica Finale

Eseguire sempre:

```bash
npx tsc --noEmit
npm test
npm run build
```

Verificare runtime con DB disponibile:

- home;
- `/partite`;
- `/bonus-pubblici`;
- `/classifica-fanta`;
- `/admin/partite`;
- dettaglio partita admin;
- GreenVolley home/classifica.

## Non Obiettivi

- Non introdurre API route interne solo per query Prisma.
- Non rendere statiche pagine DB se la build richiede database disponibile.
- Non cache-are dati utente o admin privati.
- Non cambiare regole di dominio o punteggio senza aggiornare `ai_context/`.
