// Paesi / regioni "custom" non presenti nella lista ISO 3166-1.
// Vengono uniti agli altri paesi (vedi lib/flags.ts) e diventano selezionabili
// nel dropdown e validi ovunque si usi un countryCode.
//
// Regole:
// - `code` deve essere univoco e NON collidere con i codici ISO a 2 lettere
//   (usa quindi un codice a 3 lettere, es. "EUS" per i Paesi Baschi).
// - `flagUrl` è il percorso esplicito alla bandiera in public/flags/.
//   A differenza dei paesi ISO (scaricati da scripts/download-flags.mjs come
//   {cc}.png) le bandiere custom si aggiungono a mano e possono essere .svg.

export type CustomCountry = {
  name: string;
  code: string;
  flagUrl: string;
};

export const CUSTOM_COUNTRIES: CustomCountry[] = [
  {
    name: "Paesi Baschi",
    code: "EUS",
    flagUrl: "/flags/paesi_baschi.svg",
  },
];
