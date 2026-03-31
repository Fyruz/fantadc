import Link from "next/link";
import { Button } from "primereact/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] px-4">
      <div className="admin-card w-full max-w-md p-6 text-center sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">Errore 404</p>
        <h1 className="mt-2 text-[22px] font-bold text-[#111827]">Pagina non trovata</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
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
