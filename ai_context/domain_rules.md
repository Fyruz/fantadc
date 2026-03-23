# Domain Rules

## Regole confermate

### Utenti e squadre fantasy

* un utente puo avere una sola squadra fantasy
* una squadra fantasy appartiene a un solo utente
* il coach e stato rimosso dal dominio
* ogni squadra fantasy deve avere un capitano

### Rose fantasy

* una squadra fantasy contiene esattamente 5 giocatori
* la composizione e fissa: 1 portiere e 4 giocatori di movimento
* i 5 giocatori della rosa devono appartenere a 5 squadre reali diverse
* un giocatore puo comparire in piu squadre fantasy
* la rosa fantasy e bloccata per l'utente dopo la creazione iniziale
* gli admin possono intervenire manualmente sulle rose
* il capitano deve appartenere alla rosa della squadra fantasy
* il capitano raddoppia il punteggio del proprio giocatore

### Giocatori e ruoli

* i ruoli validi sono solo `GK` e `PLAYER`
* il ruolo di un giocatore e fisso
* ogni giocatore appartiene a una sola squadra reale

### Nome della squadra fantasy

* il nome della squadra fantasy non deve essere unico
* il nome non e modificabile dopo la creazione utente
* alcune parole devono essere filtrate o censurate

### Partite

* ogni partita coinvolge esattamente due squadre reali
* una partita ha una squadra di casa e una squadra ospite
* una partita deve avere stati espliciti: bozza, programmata, conclusa, pubblicata
* quando un admin imposta una partita come conclusa, si apre la finestra di voto MVP
* il voto MVP resta aperto per 1 ora dalla chiusura della partita
* gli admin possono chiudere o riaprire la finestra di voto

### Giocatori presenti in partita

* solo i giocatori segnati come presenti nella partita possono essere votati come MVP
* nel torneo il set atteso e di 10 giocatori totali per partita
* la gestione dei giocatori presenti e una responsabilita admin

### Voto MVP

* un utente puo votare una sola volta per partita
* il voto non e modificabile dall'utente
* i voti dei singoli utenti sono privati
* durante la finestra di voto si puo mostrare un favorito provvisorio
* dopo la chiusura si mostra l'MVP finale della partita
* il voto MVP ha sia funzione di engagement sia impatto sul punteggio fantasy

### Punteggio e classifica

* il punteggio fantasy deriva da bonus e malus assegnati dagli admin
* il punteggio fantasy riceve anche un contributo dal risultato MVP
* il punteggio di una squadra e la somma dei punteggi dei 5 giocatori della rosa
* il raddoppio del capitano si applica al punteggio del singolo giocatore capitano
* la classifica principale e cumulata totale
* non esiste il concetto di giornata
* deve esistere uno storico punteggi per partita
* il dettaglio dei bonus assegnati deve essere consultabile

### Admin e audit

* gli admin possono creare, modificare ed eliminare squadre reali, giocatori e partite
* gli admin possono definire bonus e malus
* gli admin possono correggere dati anche dopo la pubblicazione
* le azioni admin che modificano dati devono essere tracciate in un log
* gli admin possono vedere tutte le squadre fantasy, modificarne la rosa, sospendere utenti, vedere e correggere voti
* esiste un admin di default
* gli admin possono creare altri admin
* operativamente esiste un solo livello di admin

### Accesso e visibilita

* il prodotto e pubblico per la parte non admin
* calendario, informazioni sulle partite, classifica fantasy e dettaglio squadre fantasy sono pubblici
* autenticazione e richiesta per creare la squadra fantasy e votare
* il login e email-only

## Vincoli funzionali da rispettare in applicazione

* i vincoli critici devono essere protetti anche a livello database quando possibile
* le validazioni di rosa devono impedire:
  * piu o meno di 5 giocatori
  * assenza del portiere
  * piu portieri
  * duplicazione della stessa squadra reale nella stessa rosa
  * capitano fuori rosa
* il frontend non deve essere l'unico punto di enforcement delle regole
* il calcolo del punteggio deve dipendere dai dati ufficiali registrati nel sistema

## Regole implicite utili per il progetto

* esiste una sola competizione attiva nel perimetro iniziale
* il sistema e pensato per uso comunitario locale, quindi la chiarezza operativa conta piu della complessita
* il modello dati corrente privilegia semplicita e auditabilita rispetto a casistiche avanzate
* l'area admin parte con CRUD semplici ma sicuri

## Decisioni ancora aperte

Le aree rimaste aperte sono poche e puntuali:

* valore esatto del bonus punti derivante dall'MVP
* regole custom di spareggio in classifica
* meccanismo concreto anti spam su registrazione e voto
* durata tecnica della sessione persistente
* forma finale del recupero accesso assistito da admin
