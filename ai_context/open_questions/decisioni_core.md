# Decisioni Core Da Chiudere

Questo file serve a raccogliere le risposte alle decisioni che bloccano il planning completo del progetto.

Istruzioni:

* compila i campi `Risposta`
* se una decisione non e ancora chiusa, lascia `TODO`
* se vuoi, aggiungi esempi concreti o regole operative
* quando una sezione e completa, possiamo riportare l'esito nei file di contesto principali

---

## 1. Regole di composizione della rosa

Questa sezione definisce come un utente costruisce la propria squadra fantasy.

### 1.1 Dimensione della rosa

Domande:

* quanti giocatori deve contenere la rosa
* il numero e fisso oppure c'e un minimo e un massimo
* la conferma della squadra richiede la rosa completa oppure si puo completare in piu momenti

Risposta:

`TODO`

### 1.2 Vincoli per ruolo

Domande:

* esistono quote minime o massime per ruolo
* i ruoli validi sono solo `GK`, `DEF`, `MID`, `FWD`
* un giocatore puo cambiare ruolo durante la stagione oppure il ruolo e fisso

Risposta:

`TODO`

### 1.3 Vincoli per squadra reale

Domande:

* quanti giocatori della stessa `FootballTeam` possono stare nella stessa `FantasyTeam`
* questo limite vale sempre oppure solo in fase di creazione iniziale
* ci sono squadre reali per cui vale una regola diversa

Risposta:

`TODO`

### 1.4 Unicita dei giocatori tra squadre fantasy

Domande:

* lo stesso giocatore reale puo stare in piu squadre fantasy
* se si, ci sono limiti o eccezioni
* se no, come funziona l'assegnazione del giocatore

Risposta:

`TODO`

### 1.5 Modifica della rosa nel tempo

Domande:

* la rosa e bloccata dopo la creazione iniziale oppure modificabile
* se modificabile, in quali finestre temporali
* serve tenere uno storico delle modifiche

Risposta:

`TODO`

### 1.6 Nome squadra fantasy

Domande:

* il nome della squadra deve essere unico
* il nome puo essere cambiato dopo la creazione
* esistono limiti di lunghezza o filtri su parole non ammesse

Risposta:

`TODO`

### 1.7 Esperienza utente desiderata

Domande:

* la creazione squadra deve essere un wizard guidato o una singola schermata
* vogliamo mostrare avvisi in tempo reale sui vincoli
* vogliamo far vedere subito punteggio, ruoli e riepilogo della rosa

Risposta:

`TODO`

---

## 2. Formula del punteggio e della classifica

Questa sezione definisce come vengono generati risultati e ranking fantasy.

### 2.1 Fonte del punteggio

Domande:

* il punteggio deriva solo da `PlayerMatchBonus`
* esistono altri elementi che assegnano punti oltre ai bonus
* il voto MVP influisce sul punteggio oppure resta separato

Risposta:

`TODO`

### 2.2 Tipi di bonus e malus

Domande:

* quali eventi devono produrre punti
* servono anche malus
* i tipi bonus sono pochi e fissi oppure gestibili interamente da admin

Risposta:

`TODO`

### 2.3 Logica di calcolo del punteggio squadra

Domande:

* il punteggio di una `FantasyTeam` e la somma semplice dei punti di tutti i suoi giocatori
* conta tutta la rosa oppure solo una parte
* l'allenatore fantasy modifica il punteggio

Risposta:

`TODO`

### 2.4 Periodizzazione del ranking

Domande:

* la classifica principale e cumulata totale
* serve anche una classifica per giornata o per periodo
* una "giornata" coincide con una singola partita, con un gruppo di partite o con altro

Risposta:

`TODO`

### 2.5 Gestione pari merito

Domande:

* i pari merito restano tali oppure serve uno spareggio
* se serve uno spareggio, qual e il criterio
* il criterio deve essere automatico o solo visivo

Risposta:

`TODO`

### 2.6 Storico e trasparenza

Domande:

* vogliamo vedere da dove arriva il punteggio di ogni squadra
* serve uno storico per partita, per giornata e totale
* gli utenti devono poter aprire il dettaglio del punteggio e vedere ogni bonus assegnato

Risposta:

`TODO`

### 2.7 Pubblicazione risultati

Domande:

* quando il punteggio diventa ufficiale
* gli admin possono correggere bonus dopo la pubblicazione
* se correggono, il sistema deve ricalcolare tutto in automatico

Risposta:

`TODO`

---

## 3. Comportamento del voto MVP

Questa sezione definisce il ciclo di vita completo del voto.

### 3.1 Apertura e chiusura del voto

Domande:

* quando si apre la finestra di voto
* quando si chiude
* chi decide che la partita e chiusa

Risposta:

`TODO`

### 3.2 Modificabilita del voto

Domande:

* il voto puo essere cambiato finche la finestra e aperta
* una modifica sovrascrive il voto precedente o deve restare traccia
* dopo la chiusura, l'admin puo intervenire oppure no

Risposta:

`TODO`

### 3.3 Candidati votabili

Domande:

* l'utente puo votare qualsiasi `Player` oppure solo i giocatori delle due squadre della partita
* servono esclusioni manuali
* serve mostrare elenco, ricerca o card giocatore

Risposta:

`TODO`

### 3.4 Visibilita dei voti

Domande:

* i voti dei singoli utenti sono privati, pubblici o visibili solo agli admin
* durante la finestra di voto vogliamo mostrare un favorito provvisorio
* dopo la chiusura vogliamo mostrare risultati aggregati o dettaglio completo

Risposta:

`TODO`

### 3.5 Effetto del voto MVP

Domande:

* il voto MVP serve solo per statistiche e coinvolgimento
* produce premi, badge o punti fantasy
* ha impatto solo sulla singola partita o anche sulla stagione

Risposta:

`TODO`

### 3.6 Anti abuso e correttezza

Domande:

* serve limitare spam o automazioni sul voto
* basta un voto per utente autenticato oppure servono ulteriori controlli
* vogliamo impedire il voto a utenti registrati dopo l'inizio della partita

Risposta:

`TODO`

### 3.7 Esperienza utente desiderata

Domande:

* il voto deve essere velocissimo da eseguire da mobile
* dopo il voto vogliamo mostrare conferma, riepilogo o andamento provvisorio
* vogliamo incentivare il voto con call to action nella dashboard

Risposta:

`TODO`

---

## 4. Perimetro reale dell'area admin

Questa sezione chiarisce cosa possono fare gli admin e cosa no.

### 4.1 Gestione anagrafiche

Domande:

* gli admin possono creare, modificare ed eliminare `FootballTeam`
* gli admin possono creare, modificare ed eliminare `Player`
* gli admin possono gestire la lista `FantasyCoach`

Risposta:

`TODO`

### 4.2 Gestione partite

Domande:

* gli admin possono creare e modificare le partite
* gli admin possono segnare una partita come chiusa
* servono stati espliciti della partita come bozza, programmata, chiusa, pubblicata

Risposta:

`TODO`

### 4.3 Gestione bonus

Domande:

* gli admin possono creare e modificare `BonusType`
* gli admin possono assegnare bonus e malus a un giocatore per partita
* possono correggere bonus gia pubblicati

Risposta:

`TODO`

### 4.4 Supervisione utenti e squadre fantasy

Domande:

* gli admin possono vedere tutte le squadre fantasy
* gli admin possono modificare manualmente le rose degli utenti
* gli admin possono sospendere o limitare utenti

Risposta:

`TODO`

### 4.5 Gestione dei voti MVP

Domande:

* gli admin possono vedere il dettaglio di tutti i voti
* gli admin possono annullare o correggere un voto
* gli admin possono chiudere anticipatamente o riaprire una finestra di voto

Risposta:

`TODO`

### 4.6 Amministrazione degli admin

Domande:

* chi puo creare un nuovo admin
* esiste un super admin
* serve distinguere tra admin completo e admin operativo

Risposta:

`TODO`

### 4.7 Audit e sicurezza operativa

Domande:

* quali azioni admin devono essere tracciate in un log
* il log deve essere visibile solo agli admin
* serve registrare anche valore prima e dopo delle modifiche

Risposta:

`TODO`

### 4.8 Dashboard admin

Domande:

* quali viste servono davvero nella prima versione
* serve una dashboard riepilogativa con alert e dati mancanti
* vogliamo partire con CRUD semplici oppure con interfacce piu guidate

Risposta:

`TODO`

---

## 5. Strategia di autenticazione

Questa sezione definisce come entrare nel sistema e con quali controlli.

### 5.1 Soluzione tecnica

Domande:

* vogliamo usare `NextAuth` o `Auth.js` come base
* quali provider servono nella prima versione
* usiamo solo credenziali email e password oppure anche login social

Risposta:

`TODO`

### 5.2 Registrazione utenti

Domande:

* chiunque puo registrarsi liberamente
* servono inviti o codici accesso
* servono limiti base per evitare spam account

Risposta:

`TODO`

### 5.3 Verifica e fiducia dell'account

Domande:

* serve verifica email
* se non serve, quali altri controlli minimi vogliamo
* un utente appena registrato puo fare tutto subito

Risposta:

`TODO`

### 5.4 Protezione anti spam e anti abuso

Domande:

* vogliamo captcha in registrazione
* vogliamo rate limit su login, registrazione e voto
* vogliamo blocchi semplici per IP o fingerprint applicativa

Risposta:

`TODO`

### 5.5 Recupero account

Domande:

* serve reset password
* come vogliamo gestire account dimenticati o inattivi
* serve una procedura admin di recupero o solo self service

Risposta:

`TODO`

### 5.6 Ruoli e sessione

Domande:

* i ruoli iniziali sono solo `user` e `admin`
* come viene determinato se un utente e admin
* quanto deve durare la sessione

Risposta:

`TODO`

### 5.7 Accesso pubblico ai contenuti

Domande:

* quali sezioni restano pubbliche senza login
* quali azioni richiedono autenticazione obbligatoria
* il sito deve far percepire piu un prodotto pubblico o una web app privata

Risposta:

`TODO`

---

## Esito atteso

Quando questo file sara compilato, potremo:

1. aggiornare `ai_context/open_questions.md` con decisioni piu precise
2. consolidare le regole nei file di contesto principali
3. scrivere un planning completo senza ambiguita pesanti
