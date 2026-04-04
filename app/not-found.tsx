import Link from "next/link";
import { Button } from "primereact/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4">
      <div className="admin-card w-full max-w-md p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Errore 404</p>
        <h1 className="mt-2 text-[22px] font-bold text-[var(--text-primary)]">Pagina non trovata</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          La pagina che cerchi non esiste oppure è stata spostata in un altro percorso.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/">
            <Button label="Torna alla home" />
          </Link>
        </div>
      </div>
    </div>
  );
}
