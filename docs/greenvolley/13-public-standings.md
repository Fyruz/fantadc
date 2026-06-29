# Task 13 — Pagine Pubbliche Classifica, Gironi, Eliminazione

**File da creare:**
- `app/(public)/greenvolley/classifica/page.tsx`
- `app/(public)/greenvolley/gironi/page.tsx`
- `app/(public)/greenvolley/eliminazione/page.tsx`

**Dipendenze:** Task 1 (schema), Task 2 (standings), Task 11 (layout)

---

## Passi

- [ ] **Step 1: Crea `app/(public)/greenvolley/classifica/page.tsx`**

```tsx
import { db } from "@/lib/db";
import { computeVolleyStandings } from "@/lib/volley/standings";

export default async function VolleyClassificaPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: { include: { team: { select: { id: true, name: true } } } },
      matches: {
        where: { status: "CONCLUDED" },
        include: { sets: true },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Classifica
      </h1>

      {groups.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      {groups.map((group) => {
        const teamList = group.teams.map((gt) => gt.team);
        const matches = group.matches.map((m) => ({
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          status: m.status,
          sets: m.sets,
        }));
        const standings = computeVolleyStandings(teamList, matches);

        return (
          <div key={group.id}>
            <div
              className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: "#3DD907" }}
            >
              {group.name}
            </div>
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border-soft)" }}
            >
              {/* Header */}
              <div
                className="grid grid-cols-[1fr_40px_40px_40px_40px_40px_50px] px-4 py-2 text-xs font-black uppercase tracking-wide gap-2"
                style={{
                  background: "var(--surface-1)",
                  color: "var(--text-muted)",
                  borderBottom: "1px solid var(--border-soft)",
                }}
              >
                <span>Squadra</span>
                <span className="text-center">G</span>
                <span className="text-center">V</span>
                <span className="text-center">SV</span>
                <span className="text-center">SP</span>
                <span className="text-center">PD</span>
                <span className="text-center" style={{ color: "#3DD907" }}>Pt</span>
              </div>

              {standings.map((row, i) => (
                <div
                  key={row.teamId}
                  className="grid grid-cols-[1fr_40px_40px_40px_40px_40px_50px] px-4 py-3 text-sm gap-2 items-center"
                  style={{
                    borderBottom:
                      i < standings.length - 1
                        ? "1px solid var(--border-soft)"
                        : "none",
                  }}
                >
                  <span className="font-semibold">{row.teamName}</span>
                  <span className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.played}
                  </span>
                  <span className="text-center text-xs">{row.wins}</span>
                  <span className="text-center text-xs">{row.setsWon}</span>
                  <span className="text-center text-xs">{row.setsLost}</span>
                  <span className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                    {row.disciplinaryPoints}
                  </span>
                  <span
                    className="text-center font-black"
                    style={{ color: "#3DD907" }}
                  >
                    {row.setsWon}
                  </span>
                </div>
              ))}
            </div>
            <div className="text-[10px] mt-1 px-1" style={{ color: "var(--text-muted)" }}>
              G=Giocate · V=Vittorie · SV=Set Vinti · SP=Set Persi · PD=Punteggio Disciplinare · Pt=Punti (set vinti)
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(public)/greenvolley/gironi/page.tsx`**

```tsx
import { db } from "@/lib/db";
import Link from "next/link";

export default async function VolleyGironiPublicPage() {
  const groups = await db.volleyGroup.findMany({
    orderBy: { name: "asc" },
    include: {
      teams: {
        include: { team: { select: { id: true, name: true } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Gironi
      </h1>

      {groups.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun girone disponibile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            <div
              className="px-4 py-3 font-black text-sm uppercase tracking-wide"
              style={{
                background: "#f0fde7",
                color: "#3DD907",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              {group.name}
            </div>
            {group.teams.map((gt, i) => (
              <div
                key={gt.teamId}
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom:
                    i < group.teams.length - 1
                      ? "1px solid var(--border-soft)"
                      : "none",
                }}
              >
                <span className="font-semibold text-sm">{gt.team.name}</span>
                {gt.qualified && (
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded-full"
                    style={{ background: "#f0fde7", color: "#3DD907" }}
                  >
                    Qualificata
                  </span>
                )}
              </div>
            ))}
            {group.teams.length === 0 && (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                Nessuna squadra
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Crea `app/(public)/greenvolley/eliminazione/page.tsx`**

```tsx
import { db } from "@/lib/db";
import Link from "next/link";

export default async function VolleyEliminazionePublicPage() {
  const rounds = await db.volleyKnockoutRound.findMany({
    orderBy: { order: "asc" },
    include: {
      matches: {
        where: { status: { not: "DRAFT" } },
        include: {
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          sets: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Eliminazione Diretta
      </h1>

      {rounds.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Fase a eliminazione non ancora disponibile.
        </div>
      )}

      {rounds.map((round) => (
        <div key={round.id}>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: "#3DD907" }}
          >
            {round.name}
          </div>

          {round.matches.length === 0 ? (
            <div
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: "var(--surface-1)", color: "var(--text-muted)" }}
            >
              Nessuna partita
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {round.matches.map((m) => {
                const homeSets = m.sets.filter((s) => s.homePoints > s.awayPoints).length;
                const awaySets = m.sets.filter((s) => s.awayPoints > s.homePoints).length;

                return (
                  <Link
                    key={m.id}
                    href={`/greenvolley/partite/${m.id}`}
                    className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:bg-[var(--surface-1)]"
                    style={{ border: "1px solid var(--border-soft)" }}
                  >
                    <span className="font-black text-sm flex-1">{m.homeTeam.name}</span>
                    <div className="px-4 text-center">
                      {m.status === "CONCLUDED" ? (
                        <span className="font-black text-lg" style={{ color: "#3DD907" }}>
                          {homeSets} – {awaySets}
                        </span>
                      ) : (
                        <span className="font-black" style={{ color: "var(--text-muted)" }}>
                          vs
                        </span>
                      )}
                    </div>
                    <span className="font-black text-sm flex-1 text-right">
                      {m.awayTeam.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 5: Commit**

```bash
git add app/(public)/greenvolley/classifica/ app/(public)/greenvolley/gironi/ app/(public)/greenvolley/eliminazione/
git commit -m "feat: add GreenVolley public standings, groups and knockout pages"
```
