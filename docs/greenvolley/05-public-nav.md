# Task 5 — Navigazione Pubblica

**File modificati:**
- `components/public-nav.tsx` — aggiungi link GreenVolley
- `components/public-bottom-nav.tsx` — aggiungi GreenVolley nel drawer Altro

---

## Passi

- [ ] **Step 1: Modifica `components/public-nav.tsx`**

Aggiungi un link GreenVolley nella navbar desktop dopo il blocco Extra. Individua questa sezione nel file:

```tsx
          {/* Extra */}
          {EXTRA_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
              style={{ color: "var(--text-muted)" }}
            >
              {n.label}
            </Link>
          ))}
```

E sostituiscila con:

```tsx
          {/* Extra */}
          {EXTRA_LINKS.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors hover:bg-[var(--surface-1)]"
              style={{ color: "var(--text-muted)" }}
            >
              {n.label}
            </Link>
          ))}

          <NavDivider />

          {/* GreenVolley */}
          <Link
            href="/greenvolley"
            className="px-3 py-1.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-1"
            style={{ color: "#3DD907" }}
          >
            🏐 GreenVolley
          </Link>
```

- [ ] **Step 2: Modifica `components/public-bottom-nav.tsx`**

Trova la costante `MORE_NAV` nel file:

```tsx
const MORE_NAV = [
  { href: "/gironi",       label: "Gironi",      icon: "pi-th-large"  },
  { href: "/eliminazione", label: "Eliminazione",icon: "pi-sitemap"   },
  { href: "/giocatori",    label: "Giocatori",   icon: "pi-users"     },
  { href: "/squadre",      label: "Squadre",     icon: "pi-shield"    },
  { href: "/regolamento",  label: "Regolamento", icon: "pi-book"      },
] as const;
```

Sostituiscila con (aggiunge GreenVolley in fondo):

```tsx
const MORE_NAV = [
  { href: "/gironi",        label: "Gironi",       icon: "pi-th-large"  },
  { href: "/eliminazione",  label: "Eliminazione", icon: "pi-sitemap"   },
  { href: "/giocatori",     label: "Giocatori",    icon: "pi-users"     },
  { href: "/squadre",       label: "Squadre",      icon: "pi-shield"    },
  { href: "/regolamento",   label: "Regolamento",  icon: "pi-book"      },
  { href: "/greenvolley",   label: "GreenVolley",  icon: "pi-circle-fill" },
] as const;
```

Poi trova il punto in cui i link del drawer MORE vengono renderizzati (il `MORE_NAV.map`) e aggiungi il colore verde per il link GreenVolley. Sostituisci l'intero blocco `MORE_NAV.map`:

```tsx
            {MORE_NAV.map((item) => {
              const active = isActive(item.href);
              const isGV = item.href === "/greenvolley";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={
                    active
                      ? { background: isGV ? "#f0fde7" : "var(--surface-1)", color: isGV ? "#3DD907" : "var(--primary)" }
                      : { color: isGV ? "#3DD907" : "var(--text-secondary)" }
                  }
                >
                  <i className={`pi ${item.icon} text-base`} style={isGV ? { color: "#3DD907" } : {}} />
                  {item.label}
                </Link>
              );
            })}
```

- [ ] **Step 3: Verifica TypeScript**

```bash
npx tsc --noEmit
```

Output atteso: nessun errore.

- [ ] **Step 4: Commit**

```bash
git add components/public-nav.tsx components/public-bottom-nav.tsx
git commit -m "feat: add GreenVolley link to public navigation"
```
