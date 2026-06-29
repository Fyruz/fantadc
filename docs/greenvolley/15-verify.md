# Task 15 — Verifica Finale e Commit

**Dipendenze:** tutti i task precedenti completati.

---

## Passi

- [ ] **Step 1: Controlla TypeScript su tutto il progetto**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore. Se ci sono errori, correggili prima di andare avanti.

Errori comuni da aspettarsi e come risolverli:
- `Property 'volleyTeam' does not exist on type 'PrismaClient'` → il client Prisma non è aggiornato, esegui `npx prisma generate`
- `Type 'X' is not assignable to type 'Y'` nei server actions → controlla che il tipo di ritorno dell'action sia `Promise<{ error?: string } | undefined>`
- Import non trovato → verifica i percorsi relativi (soprattutto `../../_form` nelle pagine edit)

- [ ] **Step 2: Build di produzione**

```bash
npm run build
```

Output atteso: `✓ Compiled successfully`. Nessun errore di build.

Se la build fallisce con errori di tipo, risolvi prima il TypeScript (Step 1). Se fallisce con errori di runtime (es. variabili d'ambiente mancanti), verifica il file `.env`.

- [ ] **Step 3: Verifica manuale — percorso admin**

Avvia il server di sviluppo:
```bash
npm run dev
```

Esegui manualmente questo percorso nell'ordine:

1. Vai su `/admin` → verifica che il switcher DCup/GreenVolley sia visibile nella topbar
2. Clicca su "🏐 GreenVolley" → deve portare a `/admin/greenvolley` con il logo verde
3. Crea una squadra: `/admin/greenvolley/squadre/new`
4. Crea due squadre (es. "Verde" e "Blu")
5. Crea un giocatore per ciascuna squadra: `/admin/greenvolley/giocatori/new`
6. Crea un girone: `/admin/greenvolley/gironi/new` → nome "Girone A"
7. Assegna entrambe le squadre al girone dalla pagina `/admin/greenvolley/gironi`
8. Crea una partita: `/admin/greenvolley/partite/new` → seleziona le due squadre e il girone
9. Apri la partita → segna come "Programmata"
10. Aggiungi 3 set (es. 25-20, 25-18, 20-25)
11. Segna come "Conclusa"

- [ ] **Step 4: Verifica manuale — percorso pubblico**

1. Vai su `/greenvolley` → deve mostrare la homepage con la prossima partita (se presente) e la classifica
2. Vai su `/greenvolley/partite` → deve mostrare la partita creata
3. Apri la partita → deve mostrare i 3 set con punteggi e vincitore per set
4. Vai su `/greenvolley/classifica` → deve mostrare il girone con i punti calcolati (ogni set vinto = 1 punto)
5. Vai su `/greenvolley/gironi` → deve mostrare il girone con le squadre
6. Vai su `/greenvolley/squadre` → deve mostrare le squadre con i giocatori
7. Vai su `/greenvolley/giocatori` → deve mostrare i giocatori raggruppati per squadra

- [ ] **Step 5: Verifica navigazione**

1. Desktop: la navbar pubblica deve avere il link "🏐 GreenVolley" in verde
2. Mobile: il drawer "Altro" della bottom nav pubblica deve avere "GreenVolley" in verde
3. Admin desktop: il switcher sport è visibile e funzionante
4. Admin mobile: il drawer "Altro" della bottom nav admin mostra lo switcher sport

- [ ] **Step 6: Commit finale**

```bash
git add .
git commit -m "feat: complete GreenVolley section (matches, standings, admin switcher)"
```

- [ ] **Step 7: Aggiorna ai_context se necessario**

Se il progetto ha un file `ai_context/db.md` o `ai_context/README.md`, aggiorna il data model con i nuovi modelli Volley aggiunti.

```bash
# controlla se il file esiste
ls ai_context/
```

Se esiste `ai_context/db.md`, aggiungi una sezione:

```markdown
## GreenVolley

Modelli separati dal calcio. Prefisso `Volley` su tutti.

- `VolleyTeam`: squadre reali del campionato volley
- `VolleyPlayer`: giocatori, solo anagrafica (teamId)
- `VolleyMatch`: partita con status DRAFT/SCHEDULED/CONCLUDED, collegabile a VolleyGroup o VolleyKnockoutRound, con punteggio disciplinare casa/ospite
- `VolleySet`: set della partita, setNumber (1-5), homePoints, awayPoints
- `VolleyGroup`: girone con nome
- `VolleyGroupTeam`: join VolleyGroup↔VolleyTeam, qualified flag
- `VolleyKnockoutRound`: turno eliminazione con ordine numerico

Classifica: ogni set vinto = 1 punto. Spareggi: vittorie partita, punti negli scontri diretti, quoziente punti vinti/persi, minor punteggio disciplinare, sorteggio. Calcolato on-the-fly da `lib/volley/standings.ts`.
```

```bash
git add ai_context/
git commit -m "docs: update ai_context with GreenVolley data model"
```
