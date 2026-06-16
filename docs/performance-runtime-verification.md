# Verifica Runtime Performance - 2026-06-16

## Ambiente

- Build production avviata con `next start` su `http://localhost:3010`.
- Database isolato `fantadc_runtime_check`, creato dal datasource locale e popolato con `npm run db:seed`.
- Il database locale esistente `fantadc` non e stato usato per la verifica perche `prisma migrate deploy` si ferma su una migrazione preesistente con enum `MatchStatus = PUBLISHED`.
- Auth.js richiede `trustHost` esplicito in runtime production locale. La configurazione e stata resa esplicita in `lib/auth.ts`.

## Smoke Test HTTP

| Controllo | Risultato |
| --- | --- |
| `/` | `200`, circa `282ms` |
| `/partite` | `200`, circa `48ms` |
| `/bonus-pubblici` | `200`, circa `26ms` |
| `/classifica-fanta` | `200`, circa `24ms` |
| `/squadre-fanta` | `200`, circa `22ms` |
| `/greenvolley` | `200`, circa `18ms` |
| `/greenvolley/classifica` | `200`, circa `13ms` |
| `/admin/partite` dopo login admin | `200`, circa `87ms`, nessun redirect login |
| `/admin/partite/1` dopo login admin | `200`, circa `78ms`, nessun redirect login |
| `/admin/utenti` dopo login admin | `200`, circa `47ms`, nessun redirect login |
| `/admin/utenti/1` dopo login admin | `200`, circa `36ms`, nessun redirect login |

## Asset Locali

| Asset | Risultato |
| --- | --- |
| `/icons/icon-192.png` | `200`, `Cache-Control: public, max-age=604800, stale-while-revalidate=2592000` |
| `/icons/home.svg` | `200`, `Cache-Control: public, max-age=604800, stale-while-revalidate=2592000` |
| `/images/mvp.webp` | `200`, `Cache-Control: public, max-age=604800, stale-while-revalidate=2592000` |

## Navigazione Admin

- Le route lista/dettaglio admin verificate via HTTP rispondono senza errori Prisma e senza redirect imprevisti.
- La pagina utenti usa `next/link` per le righe senza azioni annidate; le detail page admin principali hanno loading boundary dedicato.
- Verifica browser/click/tastiera non completata: il browser integrato non espone sessioni disponibili e Playwright non e installato nel progetto.

## Limiti Noti

- Non e stata eseguita una mutazione admin via UI/browser. La catena di invalidazione e stata verificata a livello codice negli step precedenti, ma non con click reale in questa verifica runtime.
- I tempi sono indicativi e misurati su macchina locale dopo startup production; non sostituiscono tracing APM o test di carico.

