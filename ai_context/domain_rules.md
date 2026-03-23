# Domain Rules

## Regole confermate

### Utenti e squadre fantasy

* un utente puo avere una sola squadra fantasy
* una squadra fantasy appartiene a un solo utente
* una squadra fantasy ha un solo allenatore fantasy

### Allenatori fantasy

* gli allenatori fantasy provengono da una lista persistita
* piu squadre fantasy possono scegliere lo stesso allenatore

### Squadre reali e giocatori

* ogni giocatore appartiene a una sola squadra reale
* una squadra reale puo avere molti giocatori

### Rose fantasy

* una squadra fantasy contiene molti giocatori
* un giocatore puo comparire in piu squadre fantasy
* la rosa fantasy e statica nel tempo
* non esiste ancora storico trasferimenti

### Partite

* ogni partita coinvolge esattamente due squadre reali
* una partita ha una squadra di casa e una squadra ospite
* la partita e il contenitore sia dei voti MVP sia dei bonus

### Voto MVP

* un utente puo votare una sola volta per partita
* il voto consiste nella scelta di un giocatore
* il voto MVP non coincide con il punteggio fantasy

### Bonus

* i bonus sono definiti tramite una lista di tipi bonus persistita
* ogni tipo bonus ha un valore punti associato
* il bonus assegnato a un giocatore in una partita salva anche uno snapshot dei punti
* i bonus possono avere quantita
* i bonus sono assegnati solo dagli admin

## Vincoli funzionali da rispettare in applicazione

* i vincoli critici devono essere protetti anche a livello database
* il frontend non deve essere l'unico punto di enforcement delle regole
* il calcolo del punteggio deve dipendere dai dati ufficiali registrati nel sistema

## Regole implicite utili per il progetto

* esiste una sola competizione attiva nel perimetro iniziale
* il sistema e pensato per uso comunitario locale, quindi la chiarezza operativa conta piu della complessita
* il modello dati corrente privilegia semplicita e auditabilita rispetto a casistiche avanzate

## Decisioni non ancora chiuse

Le seguenti aree esistono nel prodotto ma non sono ancora formalizzate in modo definitivo:

* dimensione della rosa fantasy
* eventuali limiti per ruolo
* eventuali limiti per numero di giocatori della stessa squadra reale
* effetto dell'allenatore sul punteggio o solo valore descrittivo
* formula esatta della classifica

Per queste decisioni fare riferimento a `open_questions.md`.
