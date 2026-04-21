import Link from "next/link";
import type { PaginationState } from "@/lib/pagination";
import { buildPageHref } from "@/lib/pagination";

type Row = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  isSuspended: boolean;
  fantasyTeam: { id: number } | null;
};

export default function UtentiTable({
  rows,
  pagination,
}: {
  rows: Row[];
  pagination: PaginationState;
}) {
  const previousHref =
    pagination.currentPage > 1
      ? buildPageHref("/admin/utenti", pagination.currentPage - 1)
      : null;
  const nextHref =
    pagination.currentPage < pagination.totalPages
      ? buildPageHref("/admin/utenti", pagination.currentPage + 1)
      : null;

  return (
    <div className="card overflow-hidden">
      {pagination.totalItems === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessun utente.</p>
      ) : (
        <>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--surface-1)] transition-colors"
              style={idx < rows.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                  {row.email}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {row.name && (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {row.name}
                    </span>
                  )}
                  {row.role === "ADMIN" ? (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(234,179,8,0.12)", color: "#92400E", border: "1px solid rgba(234,179,8,0.3)" }}
                    >
                      ADMIN
                    </span>
                  ) : (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
                    >
                      USER
                    </span>
                  )}
                  {row.isSuspended && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(239,68,68,0.10)", color: "#991B1B", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      Sospeso
                    </span>
                  )}
                  {row.fantasyTeam && (
                    <span className="inline-flex items-center gap-1 text-[10px]" style={{ color: "var(--text-disabled)" }}>
                      <i className="pi pi-trophy text-[9px]" />
                      squadra
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/admin/utenti/${row.id}`}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors flex-shrink-0"
                style={{ color: "var(--primary)" }}
                title="Dettaglio"
              >
                <i className="pi pi-chevron-right text-sm" />
              </Link>
            </div>
          ))}
          {pagination.totalPages > 1 && (
            <div
              className="flex items-center justify-between gap-3 px-4 py-3 flex-wrap"
              style={{ borderTop: "1px solid var(--border-soft)", background: "var(--surface-1)" }}
            >
              <div className="flex flex-col">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {pagination.from}–{pagination.to} di {pagination.totalItems}
                </span>
                <span className="text-[11px]" style={{ color: "var(--text-disabled)" }}>
                  Pagina {pagination.currentPage} di {pagination.totalPages}
                </span>
              </div>
              <div className="flex gap-2">
                {previousHref ? (
                  <Link
                    href={previousHref}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-wide transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)", background: "#fff" }}
                  >
                    <i className="pi pi-chevron-left text-[10px]" />
                    Prec.
                  </Link>
                ) : (
                  <span
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-wide opacity-50 cursor-not-allowed"
                    style={{ borderColor: "var(--border-medium)", color: "var(--text-secondary)", background: "#fff" }}
                    aria-disabled="true"
                  >
                    <i className="pi pi-chevron-left text-[10px]" />
                    Prec.
                  </span>
                )}
                {nextHref ? (
                  <Link
                    href={nextHref}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-wide transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "rgba(1,7,163,0.06)" }}
                  >
                    Succ.
                    <i className="pi pi-chevron-right text-[10px]" />
                  </Link>
                ) : (
                  <span
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-wide opacity-50 cursor-not-allowed"
                    style={{ borderColor: "var(--primary)", color: "var(--primary)", background: "rgba(1,7,163,0.06)" }}
                    aria-disabled="true"
                  >
                    Succ.
                    <i className="pi pi-chevron-right text-[10px]" />
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
