# User Flows

## 1. Onboarding utente

Obiettivo: permettere a un partecipante di entrare nel sistema e iniziare il fantacalcio.

Flusso base:

1. l'utente arriva nell'area pubblica
2. si registra oppure accede
3. il sistema verifica se ha gia una squadra fantasy
4. se non esiste, viene guidato alla creazione della squadra
5. se esiste, entra nella dashboard personale

## 2. Creazione squadra fantasy

Obiettivo: configurare la squadra iniziale dell'utente.

Flusso base:

1. l'utente inserisce il nome della squadra fantasy
2. sceglie un allenatore fantasy dalla lista disponibile
3. consulta la lista dei giocatori del torneo
4. seleziona i giocatori per comporre la rosa
5. conferma la squadra
6. il sistema salva la squadra e impedisce la creazione di una seconda squadra per lo stesso utente

Da definire:

* numero massimo di giocatori
* eventuali vincoli per ruolo
* eventuali vincoli per squadra reale
* possibilita di modifica successiva della rosa

## 3. Consultazione torneo

Obiettivo: permettere all'utente di capire stato del torneo e del fantacalcio.

Viste principali:

* elenco squadre reali
* elenco giocatori
* dettaglio giocatore
* calendario partite
* dettaglio partita
* classifica fantasy
* dettaglio squadra fantasy

## 4. Voto MVP

Obiettivo: raccogliere un voto utente per ogni partita.

Flusso base:

1. l'utente apre una partita
2. visualizza i giocatori coinvolti o il contesto della partita
3. seleziona un giocatore come MVP
4. il sistema registra il voto
5. se l'utente ha gia votato per quella partita, il sistema blocca un secondo voto

Da definire:

* finestra temporale di voto
* possibilita di modificare il voto prima della chiusura
* visibilita pubblica o privata dei voti

## 5. Gestione admin del torneo

Obiettivo: mantenere i dati ufficiali del sistema.

Flussi base:

1. creare e aggiornare squadre reali
2. creare e aggiornare giocatori
3. creare e aggiornare partite
4. creare tipi bonus
5. assegnare bonus ai giocatori per partita
6. controllare dati incoerenti o incompleti

## 6. Calcolo risultati fantasy

Obiettivo: mostrare punteggi e classifiche coerenti con i dati ufficiali.

Flusso logico:

1. gli admin assegnano bonus per partita ai giocatori
2. il sistema aggrega i bonus dei giocatori presenti nelle squadre fantasy
3. vengono generati punteggi e classifiche
4. gli utenti consultano riepiloghi e ranking

Da definire:

* se il punteggio e totale cumulato o per giornata
* gestione dei pari merito
* impatto dell'allenatore fantasy
* eventuali penalita aggiuntive
