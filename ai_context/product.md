# Product Context

## Progetto

Fantadc e il gestore di un fantacalcio legato a un torneo di paese.
Gli utenti registrati possono creare la propria squadra fantasy scegliendo i giocatori che partecipano al torneo reale.

## Obiettivo MVP

L'MVP deve permettere di:

1. registrare utenti
2. creare una squadra fantasy per utente
3. scegliere un allenatore fantasy da una lista predefinita
4. comporre la rosa scegliendo giocatori dal torneo reale
5. consultare squadre, giocatori e partite
6. votare l'MVP di una partita
7. permettere agli admin di assegnare bonus ai giocatori per partita
8. calcolare il punteggio fantasy sulla base dei bonus assegnati

## Perche esiste

Il prodotto serve a gestire in modo semplice e centralizzato un fantacalcio locale, evitando fogli sparsi, regole poco chiare e conteggi manuali.

## Utenti principali

### Partecipante

Utente registrato che crea una sola squadra fantasy e interagisce con il torneo.

### Admin organizzatore

Persona che gestisce dati del torneo, partite e bonus ufficiali.

## Perimetro iniziale

Incluso nell'avvio del progetto:

* una sola competizione
* squadre fantasy create dagli utenti
* rosa fantasy associata a un utente
* lista giocatori del torneo reale
* calendario partite
* voto MVP per partita
* bonus assegnati dagli admin
* classifiche e viste riepilogative

## Non obiettivi per il primo step

Fuori scope per ora:

* multi stagione
* asta o mercato trasferimenti
* modifiche storicizzate della rosa
* notifiche push
* pagamenti
* ruoli complessi oltre admin e utente
* live scoring in tempo reale

## Assunzioni correnti

* ogni utente ha una sola squadra fantasy
* la rosa e statica
* un giocatore reale puo comparire in piu squadre fantasy
* i bonus ufficiali sono la fonte di verita per il punteggio
* il voto MVP e separato dal punteggio fantasy

## Macro aree applicative

* area pubblica: presentazione torneo, accesso, regolamento
* area utente: squadra, giocatori, partite, voti, classifica
* area admin: anagrafiche, partite, bonus, supervisione

## Glossario minimo

* `FootballTeam`: squadra reale del torneo
* `FantasyTeam`: squadra fantasy creata da un utente
* `FantasyCoach`: allenatore selezionabile per la squadra fantasy
* `Vote`: voto MVP espresso da un utente su una partita
* `BonusType`: tipo di bonus o malus configurabile
* `PlayerMatchBonus`: assegnazione concreta di un bonus a un giocatore in una partita
