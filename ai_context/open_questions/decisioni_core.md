# Decisioni Core Da Chiudere

Questo file serve a raccogliere le risposte alle decisioni che bloccano il planning completo del progetto.

Istruzioni:

* compila i campi `Risposta`
* se una decisione non e ancora chiusa, lascia `TODO`
* se vuoi, aggiungi esempi concreti o regole operative
* quando una sezione e completa, possiamo riportare l'esito nei file di contesto principali
* puoi rispondere anche in forma rapida usando i codici numerici, per esempio `1.1.1: 11 giocatori`

---

## 1. Regole di composizione della rosa

Questa sezione definisce come un utente costruisce la propria squadra fantasy.

### 1.1 Dimensione della rosa

Domande:

1. `1.1.1` Quanti giocatori deve contenere la rosa?
2. `1.1.2` Il numero e fisso oppure c'e un minimo e un massimo?
3. `1.1.3` La conferma della squadra richiede la rosa completa oppure si puo completare in piu momenti?

Risposta:

* `1.1.1`: 4 giocatori e 1 portiere
* `1.1.2`: esattamente 4 + 1
* `1.1.3`: completa

### 1.2 Vincoli per ruolo

Domande:

1. `1.2.1` Esistono quote minime o massime per ruolo?
2. `1.2.2` I ruoli validi sono solo `GK`, `DEF`, `MID`, `FWD`?
3. `1.2.3` Un giocatore puo cambiare ruolo durante la stagione oppure il ruolo e fisso?

Risposta:

* `1.2.1`: 2 ruoli, giocatore e portiere
* `1.2.2`: 2 ruoli, giocatore e portiere
* `1.2.3`: no

### 1.3 Vincoli per squadra reale

Domande:

1. `1.3.1` Quanti giocatori della stessa `FootballTeam` possono stare nella stessa `FantasyTeam`?
2. `1.3.2` Questo limite vale sempre oppure solo in fase di creazione iniziale?
3. `1.3.3` Ci sono squadre reali per cui vale una regola diversa?

Risposta:

* `1.3.1`: 5 giocatori di squadre diverse
* `1.3.2`: sempre
* `1.3.3`: no

### 1.4 Unicita dei giocatori tra squadre fantasy

Domande:

1. `1.4.1` Lo stesso giocatore reale puo stare in piu squadre fantasy?
2. `1.4.2` Se si, ci sono limiti o eccezioni?
3. `1.4.3` Se no, come funziona l'assegnazione del giocatore?

Risposta:

* `1.4.1`: si
* `1.4.2`: no
* `1.4.3`: -

### 1.5 Modifica della rosa nel tempo

Domande:

1. `1.5.1` La rosa e bloccata dopo la creazione iniziale oppure modificabile?
2. `1.5.2` Se modificabile, in quali finestre temporali?
3. `1.5.3` Serve tenere uno storico delle modifiche?

Risposta:

* `1.5.1`: è bloccata
* `1.5.2`: è bloccata
* `1.5.3`: è bloccata

### 1.6 Nome squadra fantasy

Domande:

1. `1.6.1` Il nome della squadra deve essere unico?
2. `1.6.2` Il nome puo essere cambiato dopo la creazione?
3. `1.6.3` Esistono limiti di lunghezza o filtri su parole non ammesse?

Risposta:

* `1.6.1`: no
* `1.6.2`: no
* `1.6.3`: il nome puo essere come vogliono, ma alcune parole saranno censurate

### 1.7 Esperienza utente desiderata

Domande:

1. `1.7.1` La creazione squadra deve essere un wizard guidato o una singola schermata?
2. `1.7.2` Vogliamo mostrare avvisi in tempo reale sui vincoli?
3. `1.7.3` Vogliamo far vedere subito punteggio, ruoli e riepilogo della rosa?

Risposta:

* `1.7.1`: singola schermata (campo da calcio con gli slot liberi)
* `1.7.2`: si
* `1.7.3`: no

---

## 2. Formula del punteggio e della classifica

Questa sezione definisce come vengono generati risultati e ranking fantasy.

### 2.1 Fonte del punteggio

Domande:

1. `2.1.1` Il punteggio deriva solo da `PlayerMatchBonus`?
2. `2.1.2` Esistono altri elementi che assegnano punti oltre ai bonus?
3. `2.1.3` Il voto MVP influisce sul punteggio oppure resta separato?

Risposta:

* `2.1.1`: si
* `2.1.2`: il MVP
* `2.1.3`: influsce sul voto di un valore da definire

### 2.2 Tipi di bonus e malus

Domande:

1. `2.2.1` Quali eventi devono produrre punti?
2. `2.2.2` Servono anche malus?
3. `2.2.3` I tipi bonus sono pochi e fissi oppure gestibili interamente da admin?

Risposta:

* `2.2.1`: i bonus che sono definiti nella lista apposita
* `2.2.2`: si (i bonus con -n)
* `2.2.3`: gestibili da admin

### 2.3 Logica di calcolo del punteggio squadra

Domande:

1. `2.3.1` Il punteggio di una `FantasyTeam` e la somma semplice dei punti di tutti i suoi giocatori?
2. `2.3.2` Conta tutta la rosa oppure solo una parte?
3. `2.3.3` L'allenatore fantasy modifica il punteggio?

Risposta:

* `2.3.1`: si
* `2.3.2`: tutta
* `2.3.3`: togliamo l'allenatore (ma aggiungiamo un capitano (che da x2 punti al giocatore stesso))

### 2.4 Periodizzazione del ranking

Domande:

1. `2.4.1` La classifica principale e cumulata totale?
2. `2.4.2` Serve anche una classifica per giornata o per periodo?
3. `2.4.3` Una "giornata" coincide con una singola partita, con un gruppo di partite o con altro?

Risposta:

* `2.4.1`: si
* `2.4.2`: no
* `2.4.3`: non esiste il concetto di giornata

### 2.5 Gestione pari merito

Domande:

1. `2.5.1` I pari merito restano tali oppure serve uno spareggio?
2. `2.5.2` Se serve uno spareggio, qual e il criterio?
3. `2.5.3` Il criterio deve essere automatico o solo visivo?

Risposta:

* `2.5.1`: useremo regole custom
* `2.5.2`: le decideremo poi
* `2.5.3`: -

### 2.6 Storico e trasparenza

Domande:

1. `2.6.1` Vogliamo vedere da dove arriva il punteggio di ogni squadra?
2. `2.6.2` Serve uno storico per partita, per giornata e totale?
3. `2.6.3` Gli utenti devono poter aprire il dettaglio del punteggio e vedere ogni bonus assegnato?

Risposta:

* `2.6.1`: si
* `2.6.2`: per partita
* `2.6.3`: si

### 2.7 Pubblicazione risultati

Domande:

1. `2.7.1` Quando il punteggio diventa ufficiale?
2. `2.7.2` Gli admin possono correggere bonus dopo la pubblicazione?
3. `2.7.3` Se correggono, il sistema deve ricalcolare tutto in automatico?

Risposta:

* `2.7.1`: appena messo
* `2.7.2`: si
* `2.7.3`: si

---

## 3. Comportamento del voto MVP

Questa sezione definisce il ciclo di vita completo del voto.

### 3.1 Apertura e chiusura del voto

Domande:

1. `3.1.1` Quando si apre la finestra di voto?
2. `3.1.2` Quando si chiude?
3. `3.1.3` Chi decide che la partita e chiusa?

Risposta:

* `3.1.1`: appena un admin imposta la partita come conclusa
* `3.1.2`: dopo un ora da sopra
* `3.1.3`: un admin che preme su "Partita Conclusa"

### 3.2 Modificabilita del voto

Domande:

1. `3.2.1` Il voto puo essere cambiato finche la finestra e aperta?
2. `3.2.2` Una modifica sovrascrive il voto precedente o deve restare traccia?
3. `3.2.3` Dopo la chiusura, l'admin puo intervenire oppure no?

Risposta:

* `3.2.1`: no
* `3.2.2`: -
* `3.2.3`: -

### 3.3 Candidati votabili

Domande:

1. `3.3.1` L'utente puo votare qualsiasi `Player` oppure solo i giocatori delle due squadre della partita?
2. `3.3.2` Servono esclusioni manuali?
3. `3.3.3` Serve mostrare elenco, ricerca o card giocatore?

Risposta:

* `3.3.1`: solo i giocatori che hanno giocato nella partita
* `3.3.2`: no
* `3.3.3`: saranno mostrati 10 giocatori in tutto, useremo una interfaccia semplice ma efficace

### 3.4 Visibilita dei voti

Domande:

1. `3.4.1` I voti dei singoli utenti sono privati, pubblici o visibili solo agli admin?
2. `3.4.2` Durante la finestra di voto vogliamo mostrare un favorito provvisorio?
3. `3.4.3` Dopo la chiusura vogliamo mostrare risultati aggregati o dettaglio completo?

Risposta:

* `3.4.1`: privati
* `3.4.2`: si
* `3.4.3`: il vincitore MVP della partita

### 3.5 Effetto del voto MVP

Domande:

1. `3.5.1` Il voto MVP serve solo per statistiche e coinvolgimento?
2. `3.5.2` Produce premi, badge o punti fantasy?
3. `3.5.3` Ha impatto solo sulla singola partita o anche sulla stagione?

Risposta:

* `3.5.1`: entrambi
* `3.5.2`: punti fantasy, decideremo quanto dopo
* `3.5.3`: a partita

### 3.6 Anti abuso e correttezza

Domande:

1. `3.6.1` Serve limitare spam o automazioni sul voto?
2. `3.6.2` Basta un voto per utente autenticato oppure servono ulteriori controlli?
3. `3.6.3` Vogliamo impedire il voto a utenti registrati dopo l'inizio della partita?

Risposta:

* `3.6.1`: uno a persona (a device, vanno messere regole per evitare di fare troppe votazioni)
* `3.6.2`: a device (magari a ip non so)
* `3.6.3`: -

### 3.7 Esperienza utente desiderata

Domande:

1. `3.7.1` Il voto deve essere velocissimo da eseguire da mobile?
2. `3.7.2` Dopo il voto vogliamo mostrare conferma, riepilogo o andamento provvisorio?
3. `3.7.3` Vogliamo incentivare il voto con call to action nella dashboard?

Risposta:

* `3.7.1`: si
* `3.7.2`: conferma e andamento provvisorio
* `3.7.3`: si

---

## 4. Perimetro reale dell'area admin

Questa sezione chiarisce cosa possono fare gli admin e cosa no.

### 4.1 Gestione anagrafiche

Domande:

1. `4.1.1` Gli admin possono creare, modificare ed eliminare `FootballTeam`?
2. `4.1.2` Gli admin possono creare, modificare ed eliminare `Player`?
3. `4.1.3` Gli admin possono gestire la lista `FantasyCoach`?

Risposta:

* `4.1.1`: si
* `4.1.2`: si
* `4.1.3`: i coach non li metteremo piu

### 4.2 Gestione partite

Domande:

1. `4.2.1` Gli admin possono creare e modificare le partite?
2. `4.2.2` Gli admin possono segnare una partita come chiusa?
3. `4.2.3` Servono stati espliciti della partita come bozza, programmata, chiusa, pubblicata?

Risposta:

* `4.2.1`: si
* `4.2.2`: si
* `4.2.3`: si, tutti quanti

### 4.3 Gestione bonus

Domande:

1. `4.3.1` Gli admin possono creare e modificare `BonusType`?
2. `4.3.2` Gli admin possono assegnare bonus e malus a un giocatore per partita?
3. `4.3.3` Possono correggere bonus gia pubblicati?

Risposta:

* `4.3.1`: si
* `4.3.2`: si
* `4.3.3`: si

### 4.4 Supervisione utenti e squadre fantasy

Domande:

1. `4.4.1` Gli admin possono vedere tutte le squadre fantasy?
2. `4.4.2` Gli admin possono modificare manualmente le rose degli utenti?
3. `4.4.3` Gli admin possono sospendere o limitare utenti?

Risposta:

* `4.4.1`: si
* `4.4.2`: si
* `4.4.3`: si

### 4.5 Gestione dei voti MVP

Domande:

1. `4.5.1` Gli admin possono vedere il dettaglio di tutti i voti?
2. `4.5.2` Gli admin possono annullare o correggere un voto?
3. `4.5.3` Gli admin possono chiudere anticipatamente o riaprire una finestra di voto?

Risposta:

* `4.5.1`: si
* `4.5.2`: si
* `4.5.3`: si

### 4.6 Amministrazione degli admin

Domande:

1. `4.6.1` Chi puo creare un nuovo admin?
2. `4.6.2` Esiste un super admin?
3. `4.6.3` Serve distinguere tra admin completo e admin operativo?

Risposta:

* `4.6.1`: gli altri admin
* `4.6.2`: si, quello di default
* `4.6.3`: un solo livello di admin

### 4.7 Audit e sicurezza operativa

Domande:

1. `4.7.1` Quali azioni admin devono essere tracciate in un log?
2. `4.7.2` Il log deve essere visibile solo agli admin?
3. `4.7.3` Serve registrare anche valore prima e dopo delle modifiche?

Risposta:

* `4.7.1`: quelle che modificano qualcosa
* `4.7.2`: si
* `4.7.3`: si

### 4.8 Dashboard admin

Domande:

1. `4.8.1` Quali viste servono davvero nella prima versione?
2. `4.8.2` Serve una dashboard riepilogativa con alert e dati mancanti?
3. `4.8.3` Vogliamo partire con CRUD semplici oppure con interfacce piu guidate?

Risposta:

* `4.8.1`: gestione squadre, giocatori e partite (non fantasy)
* `4.8.2`: si
* `4.8.3`: crud semplici ma sicuri

---

## 5. Strategia di autenticazione

Questa sezione definisce come entrare nel sistema e con quali controlli.

### 5.1 Soluzione tecnica

Domande:

1. `5.1.1` Vogliamo usare `NextAuth` o `Auth.js` come base?
2. `5.1.2` Quali provider servono nella prima versione?
3. `5.1.3` Usiamo solo credenziali email e password oppure anche login social?

Risposta:

* `5.1.1`: nextauth
* `5.1.2`: email
* `5.1.3`: solo email

### 5.2 Registrazione utenti

Domande:

1. `5.2.1` Chiunque puo registrarsi liberamente?
2. `5.2.2` Servono inviti o codici accesso?
3. `5.2.3` Servono limiti base per evitare spam account?

Risposta:

* `5.2.1`: si
* `5.2.2`: no
* `5.2.3`: qualche limite semplice forse si

### 5.3 Verifica e fiducia dell'account

Domande:

1. `5.3.1` Serve verifica email?
2. `5.3.2` Se non serve, quali altri controlli minimi vogliamo?
3. `5.3.3` Un utente appena registrato puo fare tutto subito?

Risposta:

* `5.3.1`: no
* `5.3.2`: per device, massimo 3
* `5.3.3`: si

### 5.4 Protezione anti spam e anti abuso

Domande:

1. `5.4.1` Vogliamo captcha in registrazione?
2. `5.4.2` Vogliamo rate limit su login, registrazione e voto?
3. `5.4.3` Vogliamo blocchi semplici per IP o fingerprint applicativa?

Risposta:

* `5.4.1`: si se è semplice aggiungerla
* `5.4.2`: si
* `5.4.3`: no

### 5.5 Recupero account

Domande:

1. `5.5.1` Serve reset password?
2. `5.5.2` Come vogliamo gestire account dimenticati o inattivi?
3. `5.5.3` Serve una procedura admin di recupero o solo self service?

Risposta:

* `5.5.1`: no, ci sarà scritto chiedere all admin se si perde la mail
* `5.5.2`: nulla
* `5.5.3`: no

### 5.6 Ruoli e sessione

Domande:

1. `5.6.1` I ruoli iniziali sono solo `user` e `admin`?
2. `5.6.2` Come viene determinato se un utente e admin?
3. `5.6.3` Quanto deve durare la sessione?

Risposta:

* `5.6.1`: si
* `5.6.2`: gli admin li crea un altro admin dal pannello, tutti gli altri sono user
* `5.6.3`: per sempre se possibile

### 5.7 Accesso pubblico ai contenuti

Domande:

1. `5.7.1` Quali sezioni restano pubbliche senza login?
2. `5.7.2` Quali azioni richiedono autenticazione obbligatoria?
3. `5.7.3` Il sito deve far percepire piu un prodotto pubblico o una web app privata?

Risposta:

* `5.7.1`: le info delle partite / calendario etc sul torneo
* `5.7.2`: la creazioen delle squadre del fantacalcio
* `5.7.3`: prodotto pubblico

---

## Esito atteso

Quando questo file sara compilato, potremo:

1. aggiornare `ai_context/open_questions.md` con decisioni piu precise
2. consolidare le regole nei file di contesto principali
3. scrivere un planning completo senza ambiguita pesanti
