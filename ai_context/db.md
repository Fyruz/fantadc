# Fantacalcio – Domain Model & Prisma Baseline

## Obiettivo

Questo documento definisce il modello dati di base per un sistema di fantacalcio con:

* voto MVP per partita
* gestione squadre fantasy degli utenti
* assegnazione bonus da parte degli admin

Stack target:

* Next.js
* Prisma ORM
* PostgreSQL

---

## Entità principali

### Core

* User
* FantasyTeam
* FantasyCoach
* FootballTeam
* Player
* Match

### Gameplay

* Vote
* BonusType
* PlayerMatchBonus

### Tabelle ponte

* FantasyTeamPlayer

---

## Distinzioni fondamentali (IMPORTANTISSIMO)

### Squadre reali vs squadre fantasy

* `FootballTeam` → squadre reali (es. Milan, Inter)
* `FantasyTeam` → squadre create dagli utenti

### Giocatori

* un `Player` appartiene a **una sola FootballTeam**
* un `Player` può appartenere a **più FantasyTeam**

---

## Relazioni

### Utente e squadra fantasy

* `User 1 -- 1 FantasyTeam`

Vincolo:

* un utente può avere **una sola squadra fantasy**

---

### Squadra fantasy e allenatore

* `FantasyCoach 1 -- N FantasyTeam`

* la lista allenatori è persistita

* più utenti possono scegliere lo stesso allenatore

---

### Squadra fantasy e giocatori

* `FantasyTeam N -- M Player` (via `FantasyTeamPlayer`)

* rosa **statica**

* no storico trasferimenti

---

### Squadre reali e giocatori

* `FootballTeam 1 -- N Player`

---

### Partite

* `Match N -- 1 FootballTeam (home)`
* `Match N -- 1 FootballTeam (away)`

Vincolo:

* ogni partita ha esattamente **2 squadre**

---

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

* un utente può votare **una sola volta per partita**

---

### Bonus

#### Tipi bonus

* `BonusType`

Caratteristiche:

* lista definita (tipo enum persistito)
* ha punti associati (es. +3, -0.5)

---

#### Assegnazione bonus

* `PlayerMatchBonus`

Relazioni:

* `Player 1 -- N PlayerMatchBonus`
* `Match 1 -- N PlayerMatchBonus`
* `BonusType 1 -- N PlayerMatchBonus`

Significato:

* un bonus è assegnato:

  * a un giocatore
  * in una partita
  * con un certo valore

Nota:

* i bonus sono assegnati **solo dagli admin**
* NON sono voti

---

## Modelli logici principali

### Vote

Rappresenta:

* chi vota
* su quale partita
* quale giocatore

---

### PlayerMatchBonus

Rappresenta:

* evento di bonus in partita

Campi logici:

* playerId
* matchId
* bonusTypeId
* points (snapshot)
* quantity (opzionale)

---

## Regole di dominio

* un utente ha una sola squadra fantasy
* una squadra fantasy ha un solo allenatore
* un giocatore appartiene a una sola squadra reale
* un giocatore può essere in più squadre fantasy
* una partita ha due squadre reali
* un utente vota un solo giocatore per partita
* i bonus sono indipendenti dai voti
* i bonus sono assegnati dagli admin
* la rosa fantasy non cambia nel tempo

---

## Vincoli DB critici

* `FantasyTeam.userId` → UNIQUE
* `Vote(userId, matchId)` → UNIQUE
* FK su tutte le relazioni
* indici su:

  * matchId
  * playerId
  * matchId + playerId

---

## Linee guida Prisma

* modelli in **PascalCase singolare**
* campi in **camelCase** ([Prisma][1])
* relazioni esplicite su entrambi i lati ([Prisma][1])
* usare FK esplicite (`fieldId`) ([Prisma][2])
* indicizzare campi usati in query (`where`, `orderBy`) ([Prisma][1])

---

## Note architetturali

* evitare logica lato frontend per vincoli critici
* usare sempre vincoli DB per:

  * unicità voto
* evitare query multiple per voto
* evitare stato in memoria

---

## Estensioni future (non incluse ora)

* MatchStatus (SCHEDULED, LIVE, ENDED)
* stagioni/campionati
* storico rosa fantasy
* ranking globale giocatori

---

## TL;DR

Dominio centrale:

User → FantasyTeam → Player
Match → Vote → Player
Match → Bonus → Player

Due flussi separati:

* voto utenti (MVP)
* bonus admin (punteggio)

[1]: https://www.prisma.io/docs/orm/more/best-practices?utm_source=chatgpt.com "Best practices | Prisma Documentation"
[2]: https://www.prisma.io/docs/orm/prisma-schema/data-model/relations?utm_source=chatgpt.com "Relations | Prisma Documentation"
