"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-4xl">⚠</p>
      <h1 className="text-xl font-bold">Qualcosa è andato storto</h1>
      <p className="text-zinc-500 text-sm max-w-sm">
        Si è verificato un errore imprevisto. Puoi riprovare o tornare alla home.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Riprova
        </button>
        <Link href="/" className="btn-secondary">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
