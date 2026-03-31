import { db } from "@/lib/db";
import Link from "next/link";
import AdminPageHeader from "@/components/admin-page-header";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const pageSize = 50;

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
      include: { adminUser: { select: { email: true } } },
    }),
    db.adminAuditLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <AdminPageHeader title="Audit log" />
      <div className="admin-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8F9FC]">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Data</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Admin</th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Azione</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">Entità</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-[#6B7280] border-b border-[#E5E7EB]">ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr
                key={log.id}
                className={`border-b border-[#F3F4F6] last:border-0 hover:bg-[#F0F1FC] transition-colors text-xs ${
                  i % 2 === 1 ? "bg-[#FAFAFA]" : "bg-white"
                }`}
              >
                <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">
                  {log.createdAt.toLocaleString("it-IT")}
                </td>
                <td className="px-4 py-3 text-[#111827] font-medium">{log.adminUser.email}</td>
                <td className="px-4 py-3 font-mono text-[#111827]">{log.action}</td>
                <td className="hidden md:table-cell px-4 py-3 text-[#6B7280]">{log.entityType}</td>
                <td className="hidden md:table-cell px-4 py-3 text-[#9CA3AF] font-mono">{String(log.entityId)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#9CA3AF] text-sm">
                  Nessuna voce nel log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                p === currentPage
                  ? "bg-[#0107A3] text-white border-[#0107A3]"
                  : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F8F9FC] hover:text-[#111827]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

