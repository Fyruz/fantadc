import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-6xl font-black text-zinc-200">404</p>
      <h1 className="text-xl font-bold">Pagina non trovata</h1>
      <p className="text-zinc-500 text-sm">
        La pagina che cerchi non esiste o è stata spostata.
      </p>
      <Link href="/" className="btn-primary">
        Torna alla home
      </Link>
    </div>
  );
}
