# Open Questions

Le 5 decisioni principali sono state chiuse in `ai_context/open_questions/decisioni_core.md` e propagate nei file di contesto.

Questo file non raccoglie piu le decisioni macro iniziali: ora elenca solo i punti ancora davvero aperti prima del planning completo.

## Decisioni gia consolidate

* rosa fissa da 5 giocatori: 1 portiere e 4 giocatori di movimento
* i 5 giocatori della rosa devono appartenere a 5 squadre reali diverse
* la rosa utente e bloccata dopo la creazione
* il coach e stato rimosso dal dominio
* esiste un capitano che raddoppia il punteggio del proprio giocatore
* voto MVP aperto per 1 ora dopo che l'admin conclude la partita
* i voti singoli sono privati, ma si puo mostrare un favorito provvisorio
* il punteggio e cumulato totale, con storico per partita e senza giornate
* l'area pubblica mostra calendario, partite, classifica e squadre fantasy
* l'area admin copre anagrafiche, partite, bonus, voti, utenti, log e altri admin
* autenticazione email-only con ruoli `user` e `admin`

## Punti ancora aperti

### 1. Bonus punti MVP

Da definire:

* quanti punti fantasy assegna l'MVP della partita
* se il bonus MVP viene assegnato come bonus separato oppure come regola di calcolo dedicata

### 2. Spareggi di classifica

Da definire:

* regole custom per ordinare squadre a pari punti
* eventuale ordine dei criteri di spareggio

### 3. Anti spam e anti abuso

Da definire:

* limite concreto su registrazioni ripetute
* limite concreto su votazioni ripetute
* se introdurre captcha semplice in registrazione
* come tradurre l'idea di "massimo 3 per device" in una regola tecnica realistica

### 4. Sessione persistente

Da definire:

* cosa significa esattamente "per sempre se possibile"
* durata pratica della sessione
* eventuale strategia di rinnovo automatico

### 5. Recupero accesso assistito

Da definire:

* procedura operativa quando un utente perde accesso alla mail o alle credenziali
* responsabilita admin in assenza di reset password self service
