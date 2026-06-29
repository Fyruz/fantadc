# Task 2 - Utility Classifica

**File:** `lib/volley/standings.ts`

La classifica GreenVolley viene calcolata on-the-fly dai gironi e dalle partite concluse.

## Regole correnti

- Ogni set vinto vale 1 punto in classifica (`setsWon`).
- In caso di parita di punti nella fase a gironi, l'ordinamento applica questi criteri:
  - maggior numero di vittorie partita;
  - punti in classifica ottenuti negli scontri diretti tra le squadre ancora pari;
  - miglior quoziente tra punti vinti e punti persi (`pointsScored / pointsConceded`);
  - minor punteggio disciplinare;
  - sorteggio, se i criteri automatici non risolvono la parita.
- Il punteggio disciplinare e registrato sulla partita:
  - rosso per somma di ammonizioni: 1 punto;
  - rosso diretto: 2 punti.

## Verifica

```bash
npx tsc --noEmit
npm run build
```
