import Link from "next/link";
import type { PaginationState } from "@/lib/pagination";
import { buildPageHref } from "@/lib/pagination";

type LogRow = {
  id: number;
  createdAt: string;
  adminEmail: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
};

export default function AuditTable({
  rows,
  pagination,
}: {
  rows: LogRow[];
  pagination: PaginationState;
}) {
  const previousHref =
    pagination.currentPage > 1
      ? buildPageHref("/admin/audit", pagination.currentPage - 1)
      : null;
  const nextHref =
    pagination.currentPage < pagination.totalPages
      ? buildPageHref("/admin/audit", pagination.currentPage + 1)
      : null;

  return (
    <div className="card overflow-hidden">
      {pagination.totalItems === 0 ? (
        <p className="px-4 py-10 text-center over-label">Nessuna attività registrata.</p>
      ) : (
        <>
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-1)] transition-colors"
              style={idx < rows.length - 1 ? { borderBottom: "1px solid var(--border-soft)" } : {}}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-mono font-bold text-xs" style={{ color: "var(--text-primary)" }}>
                    {row.action}
                  </span>
                  {row.entityType && (
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}
                    >
                      {row.entityType}{row.entityId ? ` #${row.entityId}` : ""}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {row.adminEmail} · <span className="font-mono">{row.createdAt}</span>
                </div>
              </div>
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
