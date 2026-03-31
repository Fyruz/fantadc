# Public & User UI Redesign — Piano Dettagliato

## Contesto progetto

**Stack:** Next.js 15 App Router, TypeScript strict, PrimeReact 10 (lara-light-blue), Tailwind CSS v4, Prisma + PostgreSQL.

**Design tokens già in `app/globals.css`:**
```css
--primary: #0107A3        /* navy */
--primary-light: #E8E9F8
--gold: #F5C518
--bg: #F8F9FC
--surface: #FFFFFF
--border: #E5E7EB
--text-primary: #111827
--text-secondary: #6B7280

.admin-card { @apply bg-white rounded-2xl shadow-sm border border-[#E5E7EB]; }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
```

**Componenti già disponibili:**
- `components/status-badge.tsx` — `<StatusBadge status="DRAFT|SCHEDULED|CONCLUDED|PUBLISHED" />`
- `components/role-badge.tsx` — `<RoleBadge role="P|A" />` (cerchio 20x20, verde P, blu A)
- `components/stat-card.tsx` — usato solo in admin, non serve nel pubblico
- `components/admin-page-header.tsx` — usato solo in admin, NON usare nel pubblico

**Regola CLAUDE.md:** Usare sempre PrimeReact `Button`, `InputText`, ecc. al posto di `<button>` e `<input>` raw. Layout con Tailwind.

**Commit precedenti già completati (redesign admin):**
```
f8bdea2 fix: restore select clause and add logoUrl error display in form pages
1599e04 style: add card wrapper and back link to all admin form pages
d53f00e fix: add NaN guard, dialog auto-close on bonus assign, label htmlFor accessibility
0152b7f fix: spec compliance gaps in match detail — button components and text styling
f1fd319 feat: redesign match detail with navy header card and new player cards
```

---

## Task 1 — Mobile bottom nav + aggiornamento layout

**Obiettivo:** Aggiungere nav mobile (bottom bar) a tutte le pagine pubbliche e utente, come già fatto per l'admin.

### 1a. Crea `components/public-bottom-nav.tsx` (nuovo file)

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MAIN_NAV = [
  { href: "/partite",         label: "Partite",   icon: "pi-calendar" },
  { href: "/classifica",      label: "Classifica", icon: "pi-list" },
  { href: "/squadre-fantasy", label: "Fantasy",    icon: "pi-shield" },
  { href: "/dashboard",       label: "Il mio",     icon: "pi-user" },
];

const MORE_NAV = [
  { href: "/giocatori",  label: "Giocatori" },
  { href: "/squadre",    label: "Squadre reali" },
  { href: "/regolamento", label: "Regolamento" },
];

export default function PublicBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E7EB] pb-safe">
        <div className="flex items-stretch h-16">
          {MAIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-[#0107A3]" : "text-[#9CA3AF]"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#0107A3]" />
                )}
                <i className={`pi ${item.icon} text-base`} />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-[#9CA3AF]"
          >
            <i className="pi pi-ellipsis-h text-base" />
            Altro
          </button>
        </div>
      </nav>

      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl transition-transform duration-300 pb-safe ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#E5E7EB]" />
        </div>
        <div className="px-4 pb-6 flex flex-col gap-1">
          {MORE_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#F8F9FC] text-sm font-medium text-[#111827]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
```

### 1b. Modifica `components/public-nav.tsx`

**File attuale** (righe chiave):
```tsx
<nav className="flex items-center gap-1 flex-wrap">
  {NAV_LINKS.map((n) => ( ... ))}
</nav>
```

**Cambia** `className="flex items-center gap-1 flex-wrap"` → `className="hidden md:flex items-center gap-1 flex-wrap"`

Nessun'altra modifica.

### 1c. Sostituisci `app/(public)/layout.tsx`

**Stato attuale:**
```tsx
import PublicNav from "@/components/public-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">{children}</main>
      <footer className="border-t py-4 text-center text-xs text-zinc-400">
        Fantadc — Torneo di paese
      </footer>
    </div>
  );
}
```

**Sostituisci con:**
```tsx
import PublicNav from "@/components/public-nav";
import PublicBottomNav from "@/components/public-bottom-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <footer className="hidden md:block border-t py-4 text-center text-xs text-zinc-400">
        Fantadc — Torneo di paese
      </footer>
      <PublicBottomNav />
    </div>
  );
}
```

### 1d. Sostituisci `app/(user)/layout.tsx`

**Stato attuale:**
```tsx
import PublicNav from "@/components/public-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">{children}</main>
    </div>
  );
}
```

**Sostituisci con:**
```tsx
import PublicNav from "@/components/public-nav";
import PublicBottomNav from "@/components/public-bottom-nav";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FC]">
      <PublicNav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-24 md:pb-8">{children}</main>
      <PublicBottomNav />
    </div>
  );
}
```

### 1e. Verifica e commit

```bash
npx tsc --noEmit
git add components/public-bottom-nav.tsx components/public-nav.tsx "app/(public)/layout.tsx" "app/(user)/layout.tsx"
git commit -m "feat: add mobile bottom nav to public and user layouts"
```

---

## Task 2 — Login + Register: card wrapper e label styling

### 2a. Modifica `app/(public)/login/page.tsx`

**Stato attuale:**
```tsx
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold" style={{ color: "var(--primary)" }}>
            ⚽ Fantadc
          </Link>
          <p className="text-zinc-500 text-sm mt-1">Accedi al tuo account</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        <p className="text-center text-sm text-zinc-500 mt-6">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**Sostituisci con:**
```tsx
import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./_form";

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-[#0107A3]">
            ⚽ Fantadc
          </Link>
          <p className="text-[#6B7280] text-sm mt-1">Accedi al tuo account</p>
        </div>
        <div className="admin-card p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="text-center text-sm text-[#6B7280] mt-4">
          Non hai un account?{" "}
          <Link href="/register" className="font-medium text-[#0107A3] hover:underline">
            Registrati
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 2b. Modifica `app/(public)/login/_form.tsx`

Solo aggiornare le due label (righe 30 e 43):

Riga 30: `className="block text-sm font-medium mb-1"` → `className="block text-xs font-medium text-[#6B7280] mb-1"`

Riga 43: `className="block text-sm font-medium mb-1"` → `className="block text-xs font-medium text-[#6B7280] mb-1"`

Nessun'altra modifica.

### 2c. Sostituisci `app/(public)/register/page.tsx`

**Stato attuale:** file completo già letto (è un `"use client"` con form inline).

**Sostituisci con:**
```tsx
"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { register } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-[#0107A3]">
            ⚽ Fantadc
          </Link>
          <p className="text-[#6B7280] text-sm mt-1">Crea il tuo account</p>
        </div>

        <div className="admin-card p-6">
          <form action={action} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1" htmlFor="name">
                Nome (opzionale)
              </label>
              <InputText
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="w-full"
                placeholder="Mario Rossi"
              />
              {state?.errors?.name && (
                <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1" htmlFor="email">
                Email
              </label>
              <InputText
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full"
                placeholder="la-tua@email.com"
              />
              {state?.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1" htmlFor="password">
                Password{" "}
                <span className="text-[#9CA3AF] font-normal">(min. 8 caratteri)</span>
              </label>
              <input type="hidden" name="password" value={password} />
              <Password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                feedback={false}
                toggleMask
                className="w-full"
                inputClassName="w-full"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {state?.errors?.password && (
                <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {state?.message && (
              <p className="text-red-500 text-sm">{state.message}</p>
            )}

            <Button
              type="submit"
              label={pending ? "Registrazione in corso..." : "Registrati"}
              disabled={pending}
              className="w-full py-2.5"
            />
          </form>
        </div>

        <p className="text-center text-sm text-[#6B7280] mt-4">
          Hai già un account?{" "}
          <Link href="/login" className="font-medium text-[#0107A3] hover:underline">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### 2d. Verifica e commit

```bash
npx tsc --noEmit
git add "app/(public)/login/page.tsx" "app/(public)/login/_form.tsx" "app/(public)/register/page.tsx"
git commit -m "style: card wrapper and label styling on login and register pages"
```

---

## Task 3 — `/partite` (lista): StatusBadge + admin-card

### Sostituisci `app/(public)/partite/page.tsx`

**Stato attuale:** usa classi `.badge-*` CSS e div border senza card.

**Sostituisci con:**
```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import StatusBadge from "@/components/status-badge";

export default async function PartitePage() {
  const matches = await db.match.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: { startsAt: "asc" },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Calendario partite</h1>
      {matches.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna partita disponibile.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          {matches.map((m, i) => (
            <Link
              key={m.id}
              href={`/partite/${m.id}`}
              className={`flex items-center justify-between px-4 py-3 hover:bg-[#F0F1FC] transition-colors ${
                i < matches.length - 1 ? "border-b border-[#F3F4F6]" : ""
              }`}
            >
              <div>
                <p className="font-medium text-sm text-[#111827]">
                  {m.homeTeam.name}{" "}
                  <span className="text-[#9CA3AF] font-normal">vs</span>{" "}
                  {m.awayTeam.name}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {m.startsAt.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(public)/partite/page.tsx"
git commit -m "style: StatusBadge and admin-card on partite list page"
```

---

## Task 4 — `/giocatori`: RoleBadge + card sections

### Sostituisci `app/(public)/giocatori/page.tsx`

**Stato attuale:** badge inline con `style={{ backgroundColor: p.role === "P" ? "#ca8a04" : "var(--primary)" }}`.

**Sostituisci con:**
```tsx
import { db } from "@/lib/db";
import RoleBadge from "@/components/role-badge";

export default async function GiocatoriPublicPage() {
  const players = await db.player.findMany({
    orderBy: [{ footballTeam: { name: "asc" } }, { role: "asc" }, { name: "asc" }],
    include: { footballTeam: { select: { name: true, shortName: true } } },
  });

  const byTeam = new Map<string, typeof players>();
  for (const p of players) {
    const team = p.footballTeam.name;
    const arr = byTeam.get(team) ?? [];
    arr.push(p);
    byTeam.set(team, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Giocatori</h1>
      {byTeam.size === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessun giocatore presente.
        </div>
      )}
      {[...byTeam.entries()].map(([teamName, teamPlayers]) => (
        <div key={teamName} className="admin-card overflow-hidden">
          <div className="px-4 py-2 border-b border-[#F3F4F6] bg-[#F8F9FC]">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              {teamName}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3">
            {teamPlayers.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm border-b border-[#F3F4F6] ${
                  i % 2 !== 0 ? "bg-[#FAFAFA]" : ""
                }`}
              >
                <RoleBadge role={p.role} />
                <span className="font-medium text-[#111827] truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(public)/giocatori/page.tsx"
git commit -m "style: RoleBadge and card sections on giocatori page"
```

---

## Task 5 — `/classifica`: styled table con design tokens

### Sostituisci `app/(public)/classifica/page.tsx`

**Stato attuale:** usa `computeRankings()` (funzione da `lib/scoring`) — NON cambiare la fonte dati.

**Nota:** `computeRankings()` ritorna oggetti con campi: `fantasyTeamId`, `fantasyTeamName`, `userName`, `userEmail`, `totalPoints`, `rank`.

**Sostituisci con:**
```tsx
import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassificaPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Classifica</h1>
      {rankings.length === 0 ? (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessun risultato ancora pubblicato.
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8F9FC]">
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB] w-10">#</th>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Squadra</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Proprietario</th>
                <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Punti</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr
                  key={r.fantasyTeamId}
                  className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F0F1FC] transition-colors ${
                    i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-sm text-[#9CA3AF]">{r.rank}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/squadre-fantasy/${r.fantasyTeamId}`}
                      className="font-semibold text-sm text-[#0107A3] hover:underline"
                    >
                      {r.fantasyTeamName}
                    </Link>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-[#6B7280]">
                    {r.userName ?? r.userEmail}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-sm text-[#111827]">
                    {r.totalPoints.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(public)/classifica/page.tsx"
git commit -m "style: design token table on classifica page"
```

---

## Task 6 — `/squadre` e `/squadre-fantasy`: admin-card

### 6a. Sostituisci `app/(public)/squadre/page.tsx`

**Stato attuale:** card con `border rounded-xl` e `hover:bg-zinc-50`, inline style per logo.

**Sostituisci con:**
```tsx
import { db } from "@/lib/db";

export default async function SquadrePublicPage() {
  const teams = await db.footballTeam.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { players: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre reali</h1>
      {teams.length === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna squadra presente.
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {teams.map((t) => (
          <div
            key={t.id}
            className="admin-card p-4 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150"
          >
            {t.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logoUrl} alt={t.name} className="w-12 h-12 object-contain" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#0107A3] flex items-center justify-center text-white font-bold text-sm">
                {t.shortName ?? t.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-sm text-[#111827]">{t.name}</span>
            <span className="text-xs text-[#6B7280]">{t._count.players} giocatori</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6b. Sostituisci `app/(public)/squadre-fantasy/page.tsx`

**Stato attuale:** usa `computeRankings()`, card con `border rounded-xl`, inline style `style={{ color: "var(--primary)" }}` e `style={{ backgroundColor: "var(--primary)" }}`.

**Sostituisci con:**
```tsx
import { computeRankings } from "@/lib/scoring";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SquadreFantasyPublicPage() {
  const rankings = await computeRankings();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[22px] font-bold text-[#111827]">Squadre Fantasy</h1>
      {rankings.length === 0 && (
        <div className="admin-card p-8 text-center text-[#6B7280] text-sm">
          Nessuna squadra fantasy registrata.
        </div>
      )}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rankings.map((r) => (
            <Link
              key={r.fantasyTeamId}
              href={`/squadre-fantasy/${r.fantasyTeamId}`}
              className="admin-card p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-px transition-all duration-150 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-sm text-[#0107A3] group-hover:underline">
                    {r.fantasyTeamName}
                  </p>
                  <p className="text-xs text-[#6B7280]">{r.userName ?? r.userEmail}</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full text-white bg-[#0107A3] flex-shrink-0">
                  #{r.rank}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#111827]">{r.totalPoints.toFixed(1)}</p>
                <p className="text-xs text-[#6B7280]">punti</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(public)/squadre/page.tsx" "app/(public)/squadre-fantasy/page.tsx"
git commit -m "style: admin-card on squadre and squadre-fantasy list pages"
```

---

## Task 7 — `/partite/[id]`: navy header card + card sections

### Sostituisci `app/(public)/partite/[id]/page.tsx`

**Stato attuale:** usa `STATUS_LABEL`, `STATUS_CLASS`, classi `.badge-*`, div semplici senza card.

**Sostituisci con (file completo):**
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isMvpWindowOpen } from "@/lib/domain/vote";
import StatusBadge from "@/components/status-badge";
import RoleBadge from "@/components/role-badge";

export default async function PartitaPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const matchId = Number(id);
  if (isNaN(matchId)) notFound();

  const match = await db.match.findUnique({
    where: { id: matchId, status: { not: "DRAFT" } },
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
      players: {
        include: {
          player: { include: { footballTeam: { select: { name: true } } } },
        },
        orderBy: { player: { name: "asc" } },
      },
      bonuses: {
        include: { bonusType: true, player: { select: { name: true } } },
        orderBy: { id: "asc" },
      },
    },
  });
  if (!match) notFound();

  const windowOpen = isMvpWindowOpen(match.concludedAt);

  let mvpPlayer: { name: string; footballTeam: { name: string } } | null = null;
  if (!windowOpen && match.status === "PUBLISHED") {
    const topVote = await db.vote.groupBy({
      by: ["playerId"],
      where: { matchId: match.id },
      _count: { playerId: true },
      orderBy: { _count: { playerId: "desc" } },
      take: 1,
    });
    if (topVote[0]) {
      const mp = match.players.find((p) => p.playerId === topVote[0].playerId);
      if (mp) mvpPlayer = mp.player;
    }
  }

  const bonusByPlayer = new Map<string, typeof match.bonuses>();
  for (const b of match.bonuses) {
    const arr = bonusByPlayer.get(b.player.name) ?? [];
    arr.push(b);
    bonusByPlayer.set(b.player.name, arr);
  }

  return (
    <div className="flex flex-col gap-4">
      <Link href="/partite" className="text-sm text-[#6B7280] hover:text-[#111827] flex items-center gap-1 w-fit">
        <i className="pi pi-arrow-left text-xs" /> Tutte le partite
      </Link>

      {/* Navy header card */}
      <div
        className="rounded-2xl overflow-hidden p-5 flex items-start justify-between gap-4"
        style={{ background: "linear-gradient(135deg, #0107A3 0%, #0106c4 100%)" }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">
            {match.homeTeam.name} vs {match.awayTeam.name}
          </h1>
          <p className="text-[13px] text-white/80 mt-1">
            {match.startsAt.toLocaleString("it-IT", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#F5C518] text-[#111827] flex-shrink-0 mt-0.5">
          <StatusBadge status={match.status} />
        </span>
      </div>

      {/* MVP */}
      {mvpPlayer && (
        <div className="admin-card p-5 text-center">
          <p className="text-xs text-[#6B7280] uppercase tracking-wide mb-1">MVP della partita</p>
          <p className="text-xl font-bold text-[#111827]">★ {mvpPlayer.name}</p>
          <p className="text-sm text-[#6B7280] mt-0.5">{mvpPlayer.footballTeam.name}</p>
        </div>
      )}

      {windowOpen && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center text-sm text-blue-700">
          🗳️ Finestra di voto MVP aperta —{" "}
          <a href="/login" className="font-medium underline">accedi per votare</a>
        </div>
      )}

      {/* Giocatori in campo */}
      {match.players.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">
            Giocatori in campo ({match.players.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {match.players.map(({ player }) => (
              <div
                key={player.id}
                className="admin-card p-3 flex items-center gap-2"
                style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}` }}
              >
                <RoleBadge role={player.role} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#111827] truncate">{player.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{player.footballTeam.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bonus assegnati */}
      {match.status === "PUBLISHED" && match.bonuses.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[#111827] mb-3">Bonus assegnati</h2>
          <div className="admin-card overflow-hidden">
            {[...bonusByPlayer.entries()].map(([playerName, bonuses], i, arr) => (
              <div
                key={playerName}
                className={`px-4 py-3 ${i < arr.length - 1 ? "border-b border-[#F3F4F6]" : ""}`}
              >
                <p className="font-medium text-sm text-[#111827] mb-1">{playerName}</p>
                <div className="flex flex-wrap gap-1">
                  {bonuses.map((b) => (
                    <span
                      key={b.id}
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        Number(b.points) >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {b.bonusType.code}
                      {b.quantity > 1 && ` ×${b.quantity}`}{" "}
                      {Number(b.points) > 0 ? "+" : ""}{Number(b.points)}pt
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(public)/partite/[id]/page.tsx"
git commit -m "style: navy header card and card sections on partita detail page"
```

---

## Task 8 — `/squadre-fantasy/[id]`: player card con bordo ruolo

### Modifica `app/(public)/squadre-fantasy/[id]/page.tsx`

**Cambiamenti specifici (NON riscrivere l'intera logica, fare solo i diff):**

1. Aggiungere import: `import RoleBadge from "@/components/role-badge";`

2. Riga 43 — cambia il container da `max-w-2xl` a niente (o `max-w-2xl` va bene):
   ```tsx
   // Prima:
   <div className="max-w-2xl flex flex-col gap-8">
   // Dopo:
   <div className="flex flex-col gap-6">
   ```

3. Riga 46 — aggiungere page title con stile:
   ```tsx
   // Prima:
   <div>
     <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
     <p className="text-sm text-zinc-500">
   // Dopo:
   <div>
     <h1 className="text-[22px] font-bold text-[#111827] mb-1">{team.name}</h1>
     <p className="text-sm text-[#6B7280]">
   ```

4. Riga 60 — aggiungere label sezione:
   ```tsx
   // Prima:
   <h2 className="font-semibold mb-3">Rosa</h2>
   // Dopo:
   <h2 className="text-base font-semibold text-[#111827] mb-3">Rosa</h2>
   ```

5. Righe 62-91 — sostituire il player card div con versione che usa RoleBadge e bordo colorato:
   ```tsx
   // Prima: <div className={`border rounded-lg px-3 py-2.5 flex items-center gap-2 text-sm ${isCaptain ? "border-yellow-300 bg-yellow-50" : ""}`}>
   //   <span className="text-xs font-bold px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: ... }}>{player.role}</span>
   // Dopo:
   <div
     key={player.id}
     className={`admin-card p-3 flex items-center gap-2 text-sm ${isCaptain ? "!bg-[#FFFBEB] !border-amber-300" : ""}`}
     style={{ borderLeft: `3px solid ${player.role === "P" ? "#10B981" : "#3B82F6"}` }}
   >
     <RoleBadge role={player.role} />
     <div className="flex-1 min-w-0">
       <p className="font-medium text-[#111827] truncate">{player.name}</p>
       <p className="text-xs text-[#6B7280]">
         {player.footballTeam.shortName ?? player.footballTeam.name}
       </p>
     </div>
     {isCaptain && (
       <span className="text-amber-500 text-xs font-bold shrink-0" title="Capitano">★ C</span>
     )}
   </div>
   ```

6. Riga 97 — aggiornare label storico:
   ```tsx
   // Prima:
   <h2 className="font-semibold mb-3">Storico partite</h2>
   // Dopo:
   <h2 className="text-base font-semibold text-[#111827] mb-3">Storico partite</h2>
   ```

7. Riga 100 — aggiornare `details` element:
   ```tsx
   // Prima:
   <details key={match.matchId} className="border rounded-xl overflow-hidden group">
   // Dopo:
   <details key={match.matchId} className="admin-card overflow-hidden group">
   ```

8. Riga 101 — aggiornare summary:
   ```tsx
   // Prima:
   <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors list-none">
   // Dopo:
   <summary className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-[#F8F9FC] transition-colors list-none">
   ```

9. Riga 118 — aggiornare expand area:
   ```tsx
   // Prima:
   <div className="px-4 pb-3 border-t bg-zinc-50">
   // Dopo:
   <div className="px-4 pb-3 border-t border-[#F3F4F6] bg-[#F8F9FC]">
   ```

```bash
npx tsc --noEmit
git add "app/(public)/squadre-fantasy/[id]/page.tsx"
git commit -m "style: role-colored player cards and admin-card sections on squadra fantasy detail"
```

---

## Task 9 — `/dashboard`: card sections

### Sostituisci `app/(user)/dashboard/page.tsx`

**Stato attuale:** usa `.btn-primary`, `.btn-secondary`, div border senza card.

**Sostituisci con:**
```tsx
import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { db } from "@/lib/db";
import { Button } from "primereact/button";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userId = Number(user.id);

  const fantasyTeam = await db.fantasyTeam.findUnique({
    where: { userId },
    include: {
      players: { include: { player: { select: { name: true, role: true } } } },
    },
  });

  const openMatches = await db.match.findMany({
    where: { status: "CONCLUDED" },
    orderBy: { concludedAt: "desc" },
    take: 3,
    include: {
      homeTeam: { select: { name: true } },
      awayTeam: { select: { name: true } },
    },
  });

  const hasVoted = fantasyTeam
    ? await db.vote.findMany({
        where: { userId, matchId: { in: openMatches.map((m) => m.id) } },
        select: { matchId: true },
      })
    : [];

  const votedMatchIds = new Set(hasVoted.map((v) => v.matchId));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[22px] font-bold text-[#111827]">
          Ciao{user.name ? `, ${user.name}` : ""}!
        </h1>
        <p className="text-[#6B7280] text-sm">{user.email}</p>
      </div>

      {/* La mia squadra */}
      {!fantasyTeam ? (
        <div className="admin-card p-6 text-center">
          <p className="text-[#6B7280] text-sm mb-4">
            Non hai ancora creato la tua squadra fantasy.
          </p>
          <Link href="/squadra/crea">
            <Button label="Crea la tua squadra" />
          </Link>
        </div>
      ) : (
        <div className="admin-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-[#111827]">{fantasyTeam.name}</h2>
            <Link href="/squadra" className="text-sm text-[#0107A3] hover:underline">
              Vedi squadra →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {fantasyTeam.players.map(({ player }) => (
              <span
                key={player.name}
                className="text-xs bg-[#E8E9F8] text-[#0107A3] px-2 py-1 rounded-full font-medium"
              >
                {player.name}
                <span className="text-[#6B7280] ml-1 font-normal">({player.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vota MVP */}
      {openMatches.length > 0 && (
        <div className="admin-card p-4">
          <h2 className="font-semibold text-[#111827] mb-3">Vota MVP</h2>
          <div className="flex flex-col gap-0">
            {openMatches.map((m, i) => {
              const voted = votedMatchIds.has(m.id);
              return (
                <div
                  key={m.id}
                  className={`flex items-center justify-between py-2.5 ${
                    i < openMatches.length - 1 ? "border-b border-[#F3F4F6]" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-[#111827]">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </span>
                  {voted ? (
                    <span className="text-xs text-emerald-600 font-medium">Votato ✓</span>
                  ) : (
                    <Link
                      href={`/vota/${m.id}`}
                      className="text-sm text-[#0107A3] hover:underline font-medium"
                    >
                      Vota ora →
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/classifica">
          <Button label="Classifica" outlined />
        </Link>
        <Link href="/partite">
          <Button label="Calendario partite" outlined />
        </Link>
      </div>
    </div>
  );
}
```

```bash
npx tsc --noEmit
git add "app/(user)/dashboard/page.tsx"
git commit -m "style: admin-card sections on user dashboard"
```

---

## Task 10 — `/squadra`: card sections + PlayerCard migliorato

### Modifica `app/(user)/squadra/page.tsx`

**Cambiamenti specifici:**

1. Aggiungere import: `import Link from "next/link";` (già presente), aggiungere `import { Button } from "primereact/button";`

2. Riga 34 — `<div className="flex flex-col gap-8">` resta uguale.

3. Riga 36 — aggiornare heading:
   ```tsx
   // Prima: className="text-2xl font-bold mb-1"
   // Dopo: className="text-[22px] font-bold text-[#111827] mb-1"
   ```

4. Riga 38 — aggiornare sottotitolo:
   ```tsx
   // Prima: className="text-zinc-500 text-sm"
   // Dopo: className="text-[#6B7280] text-sm"
   ```

5. Riga 46 — wrappare il campo visivo in admin-card:
   ```tsx
   // Prima:
   <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center gap-4">
   // Dopo:
   <div className="admin-card overflow-hidden">
     <div className="bg-green-50 border-b border-green-100 p-6 flex flex-col items-center gap-4">
   ```
   Aggiungere `</div>` di chiusura dell'admin-card dopo il `</div>` del campo.

6. Riga 73 — label "Rosa":
   ```tsx
   // Prima: className="font-semibold mb-3"
   // Dopo: className="text-base font-semibold text-[#111827] mb-3"
   ```

7. Righe 74-97 — wrappare la table in `admin-card overflow-hidden`. Aggiungere classi ai th:
   ```tsx
   <div className="admin-card overflow-hidden">
     <table className="w-full text-sm border-collapse">
       <thead>
         <tr className="bg-[#F8F9FC] border-b border-[#E5E7EB]">
           <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Giocatore</th>
           <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Ruolo</th>
           <th className="py-3 px-4 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">Squadra</th>
         </tr>
       </thead>
       <tbody>
         {fantasyTeam.players.map(({ player }, i) => (
           <tr key={player.id} className={`border-b border-[#F3F4F6] last:border-0 ${i % 2 === 1 ? "bg-[#FAFAFA]" : ""}`}>
             <td className="py-2.5 px-4 font-medium text-[#111827]">
               {player.id === fantasyTeam.captainPlayerId && (
                 <span className="text-amber-500 mr-1">★</span>
               )}
               {player.name}
             </td>
             <td className="py-2.5 px-4 text-[#6B7280]">{player.role}</td>
             <td className="py-2.5 px-4 text-[#6B7280]">{player.footballTeam.name}</td>
           </tr>
         ))}
       </tbody>
     </table>
   </div>
   ```

8. Riga 99 — testo locked:
   ```tsx
   // Prima: className="text-xs text-zinc-400"
   // Dopo: className="text-xs text-[#9CA3AF]"
   ```

9. Riga 107 — label "Storico punteggi":
   ```tsx
   // Prima: className="font-semibold mb-3"
   // Dopo: className="text-base font-semibold text-[#111827] mb-3"
   ```

10. Riga 109 — ogni `<details>`:
    ```tsx
    // Prima: className="border rounded-lg"
    // Dopo: className="admin-card overflow-hidden"
    ```

11. Riga 110 — summary del storico:
    ```tsx
    // Prima: className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-zinc-50 rounded-lg"
    // Dopo: className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F8F9FC]"
    ```

12. Riga 150 — back link:
    ```tsx
    // Prima: <Link href="/dashboard" className="btn-secondary">← Dashboard</Link>
    // Dopo:
    <Link href="/dashboard">
      <Button label="← Dashboard" outlined size="small" />
    </Link>
    ```

13. Aggiornare la funzione `PlayerCard` (righe 156-178):
    ```tsx
    function PlayerCard({
      name,
      team,
      isCaptain,
      isGk = false,
    }: {
      name: string;
      team: string;
      isCaptain: boolean;
      isGk?: boolean;
    }) {
      return (
        <div
          className={`flex flex-col items-center rounded-xl px-4 py-3 text-center min-w-20 border ${
            isGk ? "bg-amber-50 border-amber-200" : "bg-white border-[#E5E7EB]"
          }`}
          style={{ borderLeft: `3px solid ${isGk ? "#F59E0B" : "#3B82F6"}` }}
        >
          {isCaptain && <span className="text-amber-500 text-xs mb-0.5">★ C</span>}
          <span className="font-semibold text-sm text-[#111827]">{name}</span>
          <span className="text-xs text-[#6B7280]">{team}</span>
        </div>
      );
    }
    ```

```bash
npx tsc --noEmit
git add "app/(user)/squadra/page.tsx"
git commit -m "style: admin-card sections and improved PlayerCard on squadra page"
```

---

## Task 11 — `/squadra/crea` (_form): PrimeReact InputText + Button

### Modifica `app/(user)/squadra/crea/_form.tsx`

**Cambiamenti specifici (NON toccare la logica di stato/validazione):**

1. Aggiungere import:
   ```tsx
   import { InputText } from "primereact/inputtext";
   import { Button } from "primereact/button";
   ```

2. Riga 119 — label "Nome squadra *":
   ```tsx
   // Prima: className="block text-sm font-medium mb-1"
   // Dopo: className="block text-xs font-medium text-[#6B7280] mb-1"
   ```

3. Righe 120-128 — sostituire `<input>` raw con PrimeReact `InputText`:
   ```tsx
   // Prima:
   <input
     name="name"
     value={teamName}
     onChange={(e) => setTeamName(e.target.value)}
     className="input w-full max-w-sm"
     placeholder="es. I Guerrieri"
     maxLength={40}
     required
   />
   // Dopo:
   <InputText
     name="name"
     value={teamName}
     onChange={(e) => setTeamName(e.target.value)}
     className="w-full max-w-sm"
     placeholder="es. I Guerrieri"
     maxLength={40}
     required
   />
   ```

4. Riga 156 — label "Capitano *":
   ```tsx
   // Prima: className="block text-sm font-medium mb-2"
   // Dopo: className="block text-xs font-medium text-[#6B7280] mb-2"
   ```

5. Righe 186-191 — sostituire `<button className="btn-primary">` con PrimeReact `Button`:
   ```tsx
   // Prima:
   <button
     type="submit"
     disabled={!validation.isValid || pending}
     className="btn-primary"
   >
     {pending ? "Salvo..." : "Conferma squadra"}
   </button>
   // Dopo:
   <Button
     type="submit"
     label={pending ? "Salvo..." : "Conferma squadra"}
     disabled={!validation.isValid || pending}
     className="w-full md:w-auto"
   />
   ```

6. **NON modificare** i `<button>` dei player toggle e captain — sono controlli interattivi custom con logica 3-state (selected/disabled/default) che non si mappa pulitamente su PrimeReact Button.

```bash
npx tsc --noEmit
git add "app/(user)/squadra/crea/_form.tsx"
git commit -m "style: PrimeReact InputText and Button in crea squadra form"
```

---

## Task 12 — `/vota/[id]`: card sections + styled buttons

### 12a. Modifica `app/(user)/vota/[id]/page.tsx`

**Cambiamenti specifici:**

1. Aggiungere import `Button` da primereact (per il back link) se necessario.

2. Riga 49-55 — stato "partita non conclusa":
   ```tsx
   // Aggiornare className container:
   // Prima: className="text-center py-12"
   // Dopo: className="flex flex-col gap-4 items-center py-12"
   // Aggiornare h1: className="text-[22px] font-bold text-[#111827] mb-2"
   // Aggiornare back link: className="btn-secondary" → <Button label="← Dashboard" outlined size="small" />
   ```

3. Riga 59 — container principale:
   ```tsx
   // Prima: className="flex flex-col gap-6 max-w-sm mx-auto"
   // Dopo: className="flex flex-col gap-4 max-w-sm mx-auto"
   ```

4. Righe 60-69 — header sezione:
   ```tsx
   // Aggiornare h1: className="text-[22px] font-bold text-[#111827] mb-1"
   // Aggiornare status text: className="text-sm" con colori usando token
   ```

5. Riga 73 — "già votato" box:
   ```tsx
   // Prima: className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
   // Dopo: className="admin-card p-4 text-center border-l-4 border-l-emerald-400"
   ```

6. Riga 96 — "favorito provvisorio" box:
   ```tsx
   // Prima: className="border rounded-xl p-4 text-center"
   // Dopo: className="admin-card p-4 text-center"
   ```

7. Riga 105 — "MVP finale" box:
   ```tsx
   // Prima: className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-center"
   // Dopo: className="admin-card p-5 text-center border-l-4 border-l-amber-400"
   // Aggiornare MVP name: className="text-2xl font-bold text-[#111827]"
   ```

8. Riga 116 — back link:
   ```tsx
   // Prima: <Link href="/dashboard" className="btn-secondary w-fit">← Dashboard</Link>
   // Dopo:
   <Link href="/dashboard">
     <Button label="← Dashboard" outlined size="small" />
   </Link>
   ```

### 12b. Modifica `app/(user)/vota/[id]/_vote-form.tsx`

**Stato attuale:** `<button>` per ogni player con `border rounded-xl px-4 py-3`.

**Aggiungere classe `admin-card` ai bottoni di voto** (i bottoni di voto hanno `name` e `value` quindi rimangono `<button>` raw — non hanno un equivalente PrimeReact pulito):

```tsx
// Prima:
<button
  key={p.id}
  type="submit"
  name="playerId"
  value={p.id}
  disabled={pending}
  className="flex items-center justify-between border rounded-xl px-4 py-3 text-left hover:bg-zinc-50 active:bg-zinc-100 transition-colors disabled:opacity-50"
>
// Dopo:
<button
  key={p.id}
  type="submit"
  name="playerId"
  value={p.id}
  disabled={pending}
  className="flex items-center justify-between admin-card px-4 py-3 text-left w-full hover:bg-[#F0F1FC] active:bg-[#E8E9F8] transition-colors disabled:opacity-50"
>
  <span className="font-medium text-sm text-[#111827]">{p.name}</span>
  <span className="text-xs text-[#6B7280]">{p.footballTeam.name}</span>
</button>
```

```bash
npx tsc --noEmit
git add "app/(user)/vota/[id]/page.tsx" "app/(user)/vota/[id]/_vote-form.tsx"
git commit -m "style: card sections and updated vote buttons on vota MVP page"
```

---

## Task 13 — `/regolamento`: card wrapper

### Modifica `app/(public)/regolamento/page.tsx`

**Cambiamenti minimi:**

1. Riga 2 — container esterno:
   ```tsx
   // Prima: <div className="max-w-2xl">
   // Dopo: <div className="flex flex-col gap-4 max-w-2xl">
   ```

2. Riga 4 — heading:
   ```tsx
   // Prima: <h1 className="text-2xl font-bold mb-6">Regolamento</h1>
   // Dopo: <h1 className="text-[22px] font-bold text-[#111827]">Regolamento</h1>
   ```

3. Riga 6 — wrapper del contenuto:
   ```tsx
   // Prima: <div className="flex flex-col gap-6 text-sm text-zinc-700">
   // Dopo: <div className="admin-card p-6 flex flex-col gap-6 text-sm text-[#374151]">
   ```

4. Tutte le righe con `style={{ color: "var(--primary)" }}` sugli `<h2>`:
   ```tsx
   // Prima: <h2 className="font-bold text-base mb-2" style={{ color: "var(--primary)" }}>
   // Dopo: <h2 className="font-bold text-base mb-2 text-[#0107A3]">
   ```
   Ci sono 6 occorrenze di questo pattern, rimuoverle tutte.

```bash
npx tsc --noEmit
git add "app/(public)/regolamento/page.tsx"
git commit -m "style: card wrapper and typography tokens on regolamento page"
```

---

## Task 14 — Verifica finale e build

```bash
# TypeScript check completo
npx tsc --noEmit

# Build produzione
npm run build

# Commit file sessione
git add .claude/ ai_context/.claude/
git commit -m "chore: update session files after public redesign"
```

**Build attesa:** zero errori TypeScript, build completata senza errori. Warning su `<img>` sono accettabili.

---

## Checklist visual (dopo build)

Aprire `http://localhost:3000` e verificare:

- [ ] Mobile 375px: bottom nav visibile con 4 voci + drawer Altro funzionante
- [ ] Desktop: top nav visibile, bottom nav nascosto (`md:hidden`)
- [ ] `/login`: card wrapper con ombra, label piccole grigie
- [ ] `/register`: stessa card, label aggiornate
- [ ] `/partite`: lista in admin-card, StatusBadge dots colorati
- [ ] `/partite/[id]`: header navy gradient, StatusBadge nel pill gold, player cards con bordo ruolo
- [ ] `/giocatori`: RoleBadge circles, sezione per squadra in admin-card
- [ ] `/classifica`: tabella con header grigio, zebra rows, hover navy
- [ ] `/squadre`: card grid con hover lift
- [ ] `/squadre-fantasy`: card con punti grandi, rank pill navy
- [ ] `/squadre-fantasy/[id]`: player card con bordo verde/blu, admin-card per storico
- [ ] `/dashboard`: sezioni in admin-card, player tag navy
- [ ] `/squadra`: campo verde in admin-card, PlayerCard con bordo ruolo
- [ ] `/squadra/crea`: InputText PrimeReact per nome, Button PrimeReact per submit
- [ ] `/vota/[id]`: card sections, vote buttons con hover navy
- [ ] `/regolamento`: tutto in admin-card

---

## Note per la nuova sessione

- Il file `app/globals.css` già contiene tutti i token e `.admin-card` — non serve modificarlo.
- I componenti `StatusBadge` e `RoleBadge` sono già disponibili in `components/`.
- La classe `.admin-card` equivale a `bg-white rounded-2xl shadow-sm border border-[#E5E7EB]` — usarla per tutti i container.
- Hover nav: `hover:bg-[#F0F1FC]` (tinta navy chiara).
- Page title standard: `text-[22px] font-bold text-[#111827]`.
- Label form standard: `text-xs font-medium text-[#6B7280] mb-1`.
- Testo secondario: `text-[#6B7280]`.
- Il `public-nav.tsx` è un server component (usa `getCurrentUser()`), il `public-bottom-nav.tsx` deve essere client (`"use client"`).
- La funzione `computeRankings()` da `lib/scoring` viene usata su `/classifica` e `/squadre-fantasy` — NON sostituire con query Prisma dirette.
