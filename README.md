## Fantadc

Fantadc è una web app Next.js per gestire un fantacalcio legato a un torneo locale.

## Avvio locale

1. Installa le dipendenze:

```bash
npm ci
```

2. Configura le variabili ambiente partendo da `.env.example`.

3. Avvia il server:

```bash
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Script utili

```bash
npx tsc --noEmit
npm run lint
npm test
npm run build
```

## Baseline PWA

Il progetto è predisposto come Progressive Web App:

* manifest generato da `app/manifest.ts`
* metadata PWA e icone installabili configurati in `app/layout.tsx`
* icone dedicate in `public/icons/`
* service worker custom in `public/sw.js`
* fallback offline pubblico in `app/offline/page.tsx`
* prompt di installazione/aggiornamento lato client in `components/pwa/pwa-controller.tsx`
* notifiche push MVP via service worker, VAPID e deep link diretto a `/vota/{id}`

### Verifica rapida PWA

1. esegui `npm run build && npm start`
2. apri l'app da Chrome/Edge
3. controlla che compaia il prompt di installazione
4. verifica `Application > Manifest` e `Application > Service Workers`
5. metti offline il browser e controlla il fallback `/offline`

## Notifiche push MVP

Quando una partita passa a `CONCLUDED`, Fantadc può inviare una push con link diretto alla pagina voto `/vota/{id}`.

### Configurazione

1. genera le chiavi VAPID:

```bash
npx web-push generate-vapid-keys
```

2. copia i valori in `.env.local`:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:admin@fantadc.example.com"
```

3. assicurati che `NEXTAUTH_URL` punti alla URL pubblica corretta per i deep link aperti dalle notifiche

### Comportamento

* l'utente attiva/disattiva le push dalla dashboard
* ogni browser/dispositivo salva la propria subscription
* quando l'admin conclude la partita, viene inviata una sola notifica `VOTE_OPEN` per subscription
* le subscription scadute (`404` / `410`) vengono rimosse automaticamente

## Preparazione alla pubblicazione sugli store

La parte PWA web è inclusa nel repository, ma la pubblicazione sugli store richiede ancora asset e credenziali esterni.

### Android

1. pubblica l'app web su dominio HTTPS definitivo
2. Usa PWABuilder oppure un wrapper TWA/Capacitor
3. configura package name, firma e Play Console
4. genera e carica l'APK/AAB firmato

### iOS

1. pubblica l'app web su dominio HTTPS definitivo
2. Crea un wrapper iOS con Capacitor o PWABuilder
3. configura bundle identifier, certificati e provisioning
4. genera la build da Xcode e pubblicala su App Store Connect

### Nota importante

La pubblicazione effettiva non può essere completata solo dal repository: servono account store, chiavi di firma, bundle/package identifier definitivi, policy/privacy e screenshot marketing ufficiali.
