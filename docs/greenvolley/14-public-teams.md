# Task 14 — Pagine Pubbliche Squadre e Giocatori

**File da creare:**
- `app/(public)/greenvolley/squadre/page.tsx`
- `app/(public)/greenvolley/giocatori/page.tsx`

**Dipendenze:** Task 1 (schema), Task 11 (layout)

---

## Passi

- [ ] **Step 1: Crea `app/(public)/greenvolley/squadre/page.tsx`**

```tsx
import { db } from "@/lib/db";

export default async function VolleySquadrePublicPage() {
  const teams = await db.volleyTeam.findMany({
    orderBy: { name: "asc" },
    include: {
      players: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Squadre
      </h1>

      {teams.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessuna squadra disponibile.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div
            key={team.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-soft)" }}
          >
            {/* Team header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, #0d1f0d 0%, #1a3a1a 100%)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                style={{ background: "#3DD907", color: "#fff" }}
              >
                🏐
              </div>
              <span className="font-black text-base text-white">{team.name}</span>
              <span
                className="ml-auto text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {team.players.length} giocatori
              </span>
            </div>

            {/* Players */}
            {team.players.length === 0 ? (
              <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                Nessun giocatore
              </div>
            ) : (
              <div>
                {team.players.map((p, i) => (
                  <div
                    key={p.id}
                    className="px-4 py-2.5 flex items-center gap-3"
                    style={{
                      borderBottom:
                        i < team.players.length - 1
                          ? "1px solid var(--border-soft)"
                          : "none",
                    }}
                  >
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Crea `app/(public)/greenvolley/giocatori/page.tsx`**

```tsx
import { db } from "@/lib/db";

export default async function VolleyGiocatoriPublicPage() {
  const players = await db.volleyPlayer.findMany({
    orderBy: [{ team: { name: "asc" } }, { name: "asc" }],
    include: { team: { select: { id: true, name: true } } },
  });

  // Raggruppa per squadra
  const byTeam = new Map<string, { teamName: string; players: typeof players }>();
  for (const p of players) {
    const key = p.team.name;
    if (!byTeam.has(key)) byTeam.set(key, { teamName: key, players: [] });
    byTeam.get(key)!.players.push(p);
  }
  const groups = Array.from(byTeam.values());

  return (
    <div className="flex flex-col gap-6">
      <h1
        className="font-display font-black text-2xl uppercase"
        style={{ color: "var(--text-primary)" }}
      >
        Giocatori
      </h1>

      {players.length === 0 && (
        <div className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
          Nessun giocatore disponibile.
        </div>
      )}

      {groups.map((group) => (
        <div key={group.teamName}>
          <div
            className="text-[10px] font-black uppercase tracking-widest mb-2"
            style={{ color: "#3DD907" }}
          >
            {group.teamName}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {group.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: "var(--surface-1)", border: "1px solid var(--border-soft)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                  style={{ background: "#f0fde7", color: "#3DD907" }}
                >
                  {p.name
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <span className="text-sm font-semibold truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add app/(public)/greenvolley/squadre/ app/(public)/greenvolley/giocatori/
git commit -m "feat: add GreenVolley public teams and players pages"
```
