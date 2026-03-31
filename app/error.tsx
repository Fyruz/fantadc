"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "primereact/button";

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
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FC] px-4">
      <div className="admin-card w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8E9F8] text-[#0107A3]">
          <i className="pi pi-exclamation-triangle text-2xl" />
        </div>
        <h1 className="text-[22px] font-bold text-[#111827]">Qualcosa è andato storto</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm text-[#6B7280]">
          Si è verificato un errore imprevisto. Puoi riprovare subito oppure tornare alla home.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button label="Riprova" onClick={() => reset()} className="w-full sm:w-auto" />
          <Link href="/">
            <Button label="Torna alla home" outlined className="w-full sm:w-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
