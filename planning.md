# Fantadc Planning

## Obiettivo

Costruire un MVP completo del fantacalcio del torneo di paese, coerente con il contesto definito in `ai_context/`.

Il planning e organizzato in step sequenziali, con sotto-step, dipendenze e output attesi.

## Principi di esecuzione

* partire dalle fondamenta di dominio e dati
* sbloccare presto area admin e dati ufficiali
* costruire area pubblica e area utente sopra dati gia affidabili
* mantenere audit, validazioni server e ricalcolo punteggi come responsabilita centrali
* chiudere presto i pochi punti ancora aperti che impattano l'implementazione

## Punti ancora da chiudere prima o durante i primi step

1. valore esatto del bonus MVP
2. regole di spareggio classifica
3. regole concrete anti spam su registrazione e voto
4. durata reale della sessione persistente
5. procedura operativa di recupero accesso assistito da admin

---

## Step 0. Allineamento e bootstrap tecnico

### 0.1 Verifica ambiente

* verificare dipendenze installate
* verificare presenza della documentazione Next.js locale richiesta in `AGENTS.md`
* definire file `.env` necessari
* definire convenzioni minime per naming, cartelle e moduli server
* installare tailwindcss e primereact

### 0.2 Scelte tecniche operative iniziali

* confermare libreria auth effettiva basata su `NextAuth/Auth.js`
* confermare strategia ORM con Prisma
* confermare strategia di sessione persistente
* confermare soluzione base di rate limiting
* valutare captcha semplice per registrazione

### 0.3 Setup progetto

* aggiungere dipendenze mancanti
* configurare Prisma
* configurare auth
* configurare accesso a database PostgreSQL
* predisporre base per logging amministrativo

### Output atteso

* progetto avviabile in locale
* stack tecnico confermato
* decisioni tecniche minime documentate se cambiano il contesto

---

## Step 1. Fondamenta dominio e database

### 1.1 Traduzione del modello documentale in schema reale

* creare `schema.prisma` reale a partire da `ai_context/prisma_model.md`
* includere `User`, `FantasyTeam`, `FootballTeam`, `Player`, `Match`, `MatchPlayer`, `Vote`, `BonusType`, `PlayerMatchBonus`, `FantasyTeamPlayer`, `AdminAuditLog`
* includere `captainPlayerId`, `UserRole`, `MatchStatus`

### 1.2 Migrazioni database

* creare migrazione iniziale
* verificare vincoli unici e foreign key
* verificare indici principali

### 1.3 Seed iniziali

* creare admin di default
* creare bonus type iniziali
* predisporre seed opzionali per squadre e giocatori

### 1.4 Regole server di dominio

* validazione rosa da 5 giocatori
* validazione `1 GK + 4 PLAYER`
* validazione di 5 squadre reali diverse
* validazione capitano appartenente alla rosa
* validazione voto solo su `MatchPlayer`

### Output atteso

* database consistente e migrabile
* seed minimi disponibili
* regole critiche enforceabili lato server

---

## Step 2. Autenticazione, autorizzazione e protezioni base

### 2.1 Autenticazione

* implementare registrazione email-only
* implementare login e logout
* salvare password in modo sicuro
* creare sessione persistente

### 2.2 Autorizzazione

* distinguere `Guest`, `User`, `Admin`
* proteggere rotte admin
* proteggere azioni utente che richiedono login

### 2.3 Anti spam e sicurezza minima

* rate limit su registrazione
* rate limit su login
* rate limit su voto MVP
* decidere se aggiungere captcha semplice in registrazione
* definire controlli minimi contro account multipli abusivi

### 2.4 Gestione utenti

* stato utente sospeso
* blocco accesso per utenti sospesi
* base per creazione admin da pannello admin

### Output atteso

* accesso funzionante e protetto
* ruoli applicativi utilizzabili
* protezioni minime contro spam e abuso

---

## Step 3. Struttura applicativa e layout principali

### 3.1 Layout e navigazione

* layout pubblico
* layout area utente
* layout area admin
* navigazione coerente tra aree

### 3.2 Componenti e pattern condivisi

* sistema base di tabelle e form
* stato vuoto, loading, errore
* modali o conferme per azioni sensibili
* badge per stati partita e ruoli

### 3.3 Guardie di accesso

* redirect guest -> login per azioni protette
* redirect user non admin fuori da area admin
* gestione fallback se utente non ha ancora creato la squadra

### Output atteso

* struttura UI riusabile
* base navigabile per implementare le feature

---

## Step 4. Area admin core

### 4.1 Gestione squadre reali

* lista squadre
* creazione squadra
* modifica squadra
* eliminazione squadra con controlli di sicurezza

### 4.2 Gestione giocatori

* lista giocatori
* creazione giocatore
* modifica giocatore
* assegnazione ruolo `GK` o `PLAYER`
* associazione a squadra reale
* eliminazione con controlli

### 4.3 Gestione partite

* lista partite
* creazione partita
* modifica partita
* gestione stati `DRAFT`, `SCHEDULED`, `CONCLUDED`, `PUBLISHED`
* gestione timestamp di chiusura e pubblicazione

### 4.4 Gestione partecipanti alla partita

* selezione dei giocatori che hanno preso parte alla partita
* validazione coerenza rispetto alle due squadre coinvolte
* interfaccia semplice per arrivare ai 10 giocatori attesi

### 4.5 Gestione bonus e malus

* CRUD `BonusType`
* assegnazione bonus per partita
* correzione bonus gia pubblicati
* visualizzazione storico bonus per match

### 4.6 Supervisione piattaforma

* lista utenti
* sospensione utente
* creazione admin da parte di admin
* vista di tutte le squadre fantasy
* modifica manuale delle rose da parte admin

### 4.7 Audit log

* scrittura log per azioni admin che modificano dati
* lista log admin
* dettaglio before/after quando presente

### Output atteso

* area admin completa per popolare e mantenere il sistema
* dati ufficiali gestibili senza interventi manuali sul database

---

## Step 5. Area pubblica

### 5.1 Home e regolamento

* homepage minima ma chiara
* sezione regolamento e regole base

### 5.2 Torneo pubblico

* calendario partite
* dettaglio partita pubblica
* elenco squadre reali
* elenco giocatori

### 5.3 Fantacalcio pubblico

* classifica fantasy pubblica
* dettaglio squadra fantasy pubblica
* storico punteggi per partita

### Output atteso

* tutto il contenuto non admin consultabile senza login

---

## Step 6. Area utente e creazione squadra fantasy

### 6.1 Dashboard utente

* stato account
* stato squadra fantasy
* call to action principali
* punti rapidi verso voto MVP e classifica

### 6.2 Creazione squadra

* singola schermata con visualizzazione tipo campo
* slot per 1 portiere e 4 giocatori di movimento
* selezione giocatori
* selezione capitano
* validazioni in tempo reale
* conferma finale bloccante

### 6.3 Regole di creazione

* impedire rosa incompleta
* impedire piu portieri
* impedire piu giocatori della stessa squadra reale
* impedire capitano fuori rosa
* bloccare modifiche utente dopo la conferma

### 6.4 Dettaglio squadra utente

* visualizzazione rosa
* evidenza capitano
* storico punti della squadra

### Output atteso

* utente in grado di registrarsi e creare correttamente la propria squadra fantasy

---

## Step 7. MVP voting flow

### 7.1 Apertura voto

* apertura automatica della finestra di voto quando match diventa `CONCLUDED`
* chiusura automatica dopo 1 ora
* supporto admin per chiusura o riapertura manuale

### 7.2 Interfaccia voto

* vista semplice mobile-first
* elenco dei giocatori presenti nel match
* scelta di un solo MVP
* conferma immediata del voto

### 7.3 Regole voto

* un voto per utente per partita
* nessuna modifica lato utente dopo l'invio
* blocco voto fuori finestra temporale
* applicazione rate limit dedicato

### 7.4 Risultati voto

* favorito provvisorio durante la finestra
* MVP finale dopo chiusura
* dettaglio completo dei voti solo lato admin

### Output atteso

* ciclo completo del voto MVP funzionante

---

## Step 8. Motore punteggi e classifica

### 8.1 Calcolo punteggio giocatore

* somma bonus e malus per match
* applicazione eventuale bonus MVP
* raddoppio del capitano

### 8.2 Calcolo punteggio squadra

* somma dei 5 giocatori della rosa
* aggregazione storica per partita
* aggregazione totale cumulata

### 8.3 Classifica

* classifica totale
* ordinamento base per punti
* inserimento futura regola di spareggio

### 8.4 Ricalcolo

* ricalcolo dopo modifica bonus
* ricalcolo dopo correzione voto admin
* ricalcolo dopo modifica amministrativa della rosa

### 8.5 Trasparenza del punteggio

* dettaglio punteggio per match
* dettaglio bonus assegnati
* evidenza del contributo MVP
* evidenza del raddoppio capitano

### Output atteso

* classifica affidabile, spiegabile e aggiornabile

---

## Step 9. Rifinitura admin e operativita reale

### 9.1 Workflow reali di gestione

* flusso rapido per chiudere una partita
* flusso rapido per selezionare giocatori presenti
* flusso rapido per assegnare bonus
* flusso rapido per pubblicare risultati

### 9.2 Sicurezza operativa

* conferme sulle azioni distruttive
* messaggi chiari su impatto dei ricalcoli
* visibilita dei log per admin

### 9.3 Gestione anomalie

* match senza abbastanza giocatori presenti
* bonus duplicati o incoerenti
* utenti senza squadra
* rose manualmente modificate da admin

### Output atteso

* area admin utilizzabile anche in gestione reale del torneo

---

## Step 10. Test, qualità e hardening

### 10.1 Test di dominio

* validazione rosa
* validazione capitano
* validazione voto MVP
* calcolo punteggi
* ricalcoli

### 10.2 Test di integrazione

* registrazione e login
* creazione squadra fantasy
* gestione admin squadre, giocatori, partite
* assegnazione bonus
* voto MVP

### 10.3 Test end-to-end principali

* utente si registra, crea squadra e vota
* admin crea partita, la conclude, assegna bonus e pubblica risultati
* classifica aggiornata e consultabile pubblicamente

### 10.4 Hardening

* gestione errori
* stati loading
* protezione da doppio submit
* validazione server su tutte le azioni sensibili
* verifica che la build di produzione completi senza errori

### Output atteso

* MVP sufficientemente robusto per uso reale

---

## Step 11. Seed reali, contenuti e rilascio

### 11.1 Dati iniziali reali

* import squadre reali del torneo
* import giocatori
* creazione prime partite
* configurazione bonus type iniziali

### 11.2 Rifinitura contenuti

* testi minimi per homepage e regolamento
* copy delle pagine chiave
* messaggi di errore e conferma

### 11.3 Deployment

* configurazione ambiente staging o produzione
* variabili ambiente
* database remoto
* strategia backup minima

### 11.4 Go-live checklist

* admin di default verificato
* auth verificata
* calendario popolato
* bonus type caricati
* flusso MVP verificato
* classifica verificata
* esecuzione di `npm run build` completata con successo

### Output atteso

* applicazione pronta per essere usata dal torneo

---

## Ordine consigliato di implementazione reale

1. Step 0
2. Step 1
3. Step 2
4. Step 4
5. Step 6
6. Step 7
7. Step 8
8. Step 5
9. Step 9
10. Step 10
11. Step 11

## Milestone MVP suggerite

### Milestone A

* bootstrap tecnico completato
* schema DB reale pronto
* auth pronta

### Milestone B

* area admin pronta per popolare il torneo
* squadre, giocatori, partite e bonus gestibili

### Milestone C

* utente puo registrarsi, creare squadra e vedere la propria area

### Milestone D

* voto MVP e classifica funzionano end-to-end

### Milestone E

* applicazione rifinita, testata e pronta al rilascio

## Backlog post-MVP

* spareggi configurabili
* bonus MVP configurabile da admin
* anti spam piu sofisticato
* recupero accesso self service
* storico avanzato modifiche rosa
* multi stagione
