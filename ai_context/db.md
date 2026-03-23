# Fantacalcio - Domain Model Baseline

## Obiettivo

Questo documento definisce il modello dati di base per il sistema di fantacalcio con:

* squadre fantasy statiche da 5 giocatori
* capitano che raddoppia il proprio punteggio
* voto MVP per partita
* bonus e malus assegnati dagli admin
* audit delle modifiche amministrative

Stack target:

* Next.js
* Prisma ORM
* PostgreSQL

---

## Entita principali

### Core

* User
* FantasyTeam
* FootballTeam
* Player
* Match

### Gameplay

* MatchPlayer
* Vote
* BonusType
* PlayerMatchBonus

### Supporto

* AdminAuditLog

### Tabelle ponte

* FantasyTeamPlayer

---

## Distinzioni fondamentali

### Squadre reali vs squadre fantasy

* `FootballTeam` -> squadre reali del torneo
* `FantasyTeam` -> squadre create dagli utenti

### Ruoli giocatore

* i ruoli validi sono solo `GK` e `PLAYER`
* ogni giocatore ha un ruolo fisso

### Coach

* il coach e stato rimosso dal dominio
* il posto del coach e stato sostituito dal capitano di squadra

### Capitano

* ogni `FantasyTeam` ha un capitano
* il capitano e uno dei 5 giocatori della rosa
* il capitano raddoppia il proprio punteggio

---

## Relazioni

### Utente e squadra fantasy

* `User 1 -- 1 FantasyTeam`

Vincolo:

* un utente puo avere una sola squadra fantasy

### Squadra fantasy e giocatori

* `FantasyTeam N -- M Player` via `FantasyTeamPlayer`

Vincoli funzionali:

* una rosa contiene esattamente 5 giocatori
* la composizione e 1 `GK` + 4 `PLAYER`
* i 5 giocatori devono appartenere a 5 `FootballTeam` diverse
* la rosa e statica per l'utente

### Squadra fantasy e capitano

* `FantasyTeam N -- 1 Player (captain)`

Vincolo funzionale:

* il capitano deve appartenere alla rosa della squadra fantasy

### Squadre reali e giocatori

* `FootballTeam 1 -- N Player`

### Partite

* `Match N -- 1 FootballTeam (home)`
* `Match N -- 1 FootballTeam (away)`

Vincoli:

* ogni partita ha esattamente 2 squadre
* una partita ha uno stato esplicito

### Giocatori presenti in partita

* `Match N -- M Player` via `MatchPlayer`

Significato:

* `MatchPlayer` rappresenta i giocatori che hanno preso parte alla partita
* solo questi giocatori sono candidati al voto MVP

### Voti MVP

* `User 1 -- N Vote`
* `Match 1 -- N Vote`
* `Player 1 -- N Vote`

Struttura:

* userId
* matchId
* playerId

Vincolo critico:

* `@@unique([userId, matchId])`

Significato:

* un utente puo votare una sola volta per partita

### Bonus

#### Tipi bonus

* `BonusType`

Caratteristiche:

* lista gestita dagli admin
* puo rappresentare sia bonus sia malus
* ha punti associati

#### Assegnazione bonus

* `PlayerMatchBonus`

Relazioni:

* `Player 1 -- N PlayerMatchBonus`
* `Match 1 -- N PlayerMatchBonus`
* `BonusType 1 -- N PlayerMatchBonus`

Significato:

* un bonus e assegnato a un giocatore in una partita
* il record salva anche uno snapshot dei punti

### Audit amministrativo

* `User 1 -- N AdminAuditLog`

Significato:

* ogni modifica amministrativa rilevante deve lasciare traccia

---

## Regole di dominio

* un utente ha una sola squadra fantasy
* una squadra fantasy ha un capitano
* una squadra fantasy contiene 5 giocatori
* la rosa fantasy e 1 portiere + 4 giocatori di movimento
* i 5 giocatori della rosa appartengono a 5 squadre reali diverse
* un giocatore appartiene a una sola squadra reale
* un giocatore puo essere in piu squadre fantasy
* una partita ha due squadre reali
* solo i giocatori presenti in partita possono essere votati come MVP
* un utente vota un solo giocatore per partita
* il voto MVP contribuisce al punteggio fantasy
* bonus e malus sono assegnati dagli admin
* le modifiche admin sono tracciate

---

## Vincoli DB critici

* `FantasyTeam.userId` -> UNIQUE
* `Vote(userId, matchId)` -> UNIQUE
* `MatchPlayer(matchId, playerId)` -> chiave primaria composta
* FK su tutte le relazioni
* indici su:
  * matchId
  * playerId
  * match status
  * entityType + entityId per audit log

Nota:

Alcune regole restano applicative anche se importanti:

* esattamente 5 giocatori per rosa
* 1 portiere + 4 giocatori di movimento
* una sola squadra reale per ciascun giocatore della rosa
* capitano appartenente alla rosa
* voto valido solo su giocatore presente in `MatchPlayer`

---

## Linee guida Prisma

* modelli in PascalCase singolare
* campi in camelCase
* relazioni esplicite su entrambi i lati
* FK esplicite
* indicizzare campi usati in query di filtro, ranking e audit

---

## Note architetturali

* evitare logica lato frontend per vincoli critici
* usare il database come fonte di verita per i dati ufficiali
* usare validazioni di dominio lato server per le regole non esprimibili bene nel DB
* ricalcolare i punteggi quando admin corregge bonus o voti

---

## Estensioni future

* configurazione esplicita delle regole di spareggio
* configurazione esplicita del bonus MVP
* rate limit e antifrode piu evoluti
* multi stagione
