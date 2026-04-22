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

### Verifica rapida PWA

1. esegui `npm run build && npm start`
2. apri l'app da Chrome/Edge
3. controlla che compaia il prompt di installazione
4. verifica `Application > Manifest` e `Application > Service Workers`
5. metti offline il browser e controlla il fallback `/offline`

## Preparazione alla pubblicazione sugli store

La parte PWA web è inclusa nel repository, ma la pubblicazione sugli store richiede ancora asset e credenziali esterni.

### Android

1. pubblica l'app web su dominio HTTPS definitivo
2. usa PWABuilder oppure un wrapper TWA/Capacitor
3. configura package name, firma e Play Console
4. genera e carica l'APK/AAB firmato

### iOS

1. pubblica l'app web su dominio HTTPS definitivo
2. crea un wrapper iOS con Capacitor o PWABuilder
3. configura bundle identifier, certificati e provisioning
4. genera la build da Xcode e pubblicala su App Store Connect

### Nota importante

La pubblicazione effettiva non può essere completata solo dal repository: servono account store, chiavi di firma, bundle/package identifier definitivi, policy/privacy e screenshot marketing ufficiali.
