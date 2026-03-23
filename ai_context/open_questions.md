# Open Questions

Questo file raccoglie le decisioni ancora aperte che influenzano planning, UX e implementazione.

Per un questionario piu strutturato sulle decisioni principali, usare anche `ai_context/open_questions/decisioni_core.md`.

## Regole squadra fantasy

* quanti giocatori deve contenere una rosa fantasy 
* esistono minimi o massimi per ruolo
* esiste un limite di giocatori provenienti dalla stessa squadra reale
* la rosa si puo modificare dopo la creazione iniziale oppure no 
* il nome della squadra fantasy deve essere unico oppure no

## Allenatore fantasy

* l'allenatore ha solo valore descrittivo oppure incide sul punteggio
* gli allenatori fantasy sono figure reali del torneo o elementi separati

## Voto MVP

* quando si apre e quando si chiude la finestra di voto (appena la partita viene segnalata come chiusa, si apre una finestra di 1 ora per votare)
* il voto puo essere cambiato finche la partita non viene chiusa
* i voti sono pubblici, aggregati o privati (dopo che si vota si potrebbe far vedere il favorito al momento del voto)
* il voto MVP produce solo statistiche oppure anche punti fantasy

## Bonus e classifica

* quali tipi bonus servono davvero nel torneo
* esistono anche malus
* la classifica e totale cumulata, per giornata o entrambe
* come si gestiscono i pari merito
* serve uno storico per giornata o basta il totale

## Admin operations

* chi puo nominare o creare un admin (gli altri admin, ce ne sarà uno di default)
* gli admin possono correggere dati storici gia pubblicati (SI)
* serve un log delle modifiche amministrative (SI)
* serve la possibilita di bloccare modifiche dopo la chiusura di una partita (NO)

## Accesso e account

* quale meccanismo di autenticazione usare (NextAuth)
* l'accesso e libero a chiunque o solo a partecipanti invitati (chiunque si puo registrare, ma dobbiamo evitare in qualche modo lo spam di account, qualcosa di semplice)
* serve verifica email (NO)

## Dati pubblici

* quali informazioni sono visibili senza login (tutto il pannello non admin deve essere accessibile, calendario e info sulle partite)
* la classifica fantasy deve essere pubblica (SI)
* il dettaglio squadre fantasy deve essere pubblico o riservato (pubblico)

## Priorita per il prossimo step

Prima di scrivere un planning completo conviene chiudere almeno queste decisioni:

1. regole di composizione della rosa
2. formula del punteggio e della classifica
3. comportamento del voto MVP
4. perimetro reale dell'area admin
5. strategia di autenticazione

Le quali hanno ricevuto una risposta dentro open_questions/decisioni_core.md