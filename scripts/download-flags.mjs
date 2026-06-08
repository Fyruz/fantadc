// Scarica tutte le bandiere dei paesi in public/flags/{cc}.png da flagcdn.
// Sorgente locale unica per le bandiere: niente più dipendenza da servizi esterni a runtime.
// Uso: node scripts/download-flags.mjs [--force]
import { readFile, mkdir, writeFile, access } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "flags");
const SIZE = "w320"; // larghezza flagcdn: nitido anche su retina ai formati usati
const CONCURRENCY = 8;
const FORCE = process.argv.includes("--force");

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const countries = JSON.parse(
    await readFile(path.join(ROOT, "lib", "countries.json"), "utf8")
  );
  await mkdir(OUT_DIR, { recursive: true });

  const codes = countries
    .map((c) => String(c.code).trim().toLowerCase())
    .filter((c) => /^[a-z]{2}$/.test(c));

  const failures = [];
  let downloaded = 0;
  let skipped = 0;

  let cursor = 0;
  async function worker() {
    while (cursor < codes.length) {
      const code = codes[cursor++];
      const dest = path.join(OUT_DIR, `${code}.png`);
      if (!FORCE && (await exists(dest))) {
        skipped++;
        continue;
      }
      const url = `https://flagcdn.com/${SIZE}/${code}.png`;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        if (buf.length === 0) throw new Error("empty");
        await writeFile(dest, buf);
        downloaded++;
      } catch (err) {
        failures.push({ code, error: String(err.message || err) });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(
    `Bandiere: ${downloaded} scaricate, ${skipped} saltate, ${failures.length} fallite (su ${codes.length})`
  );
  if (failures.length) {
    console.log("Fallite:", failures.map((f) => `${f.code} (${f.error})`).join(", "));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
