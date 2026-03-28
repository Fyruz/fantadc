import { db } from "@/lib/db";

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
      <h1 className="text-xl font-bold mb-6">Audit log</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Data</th>
            <th className="py-2 pr-4">Admin</th>
            <th className="py-2 pr-4">Azione</th>
            <th className="py-2 pr-4">Entità</th>
            <th className="py-2">ID</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b hover:bg-zinc-50 text-xs">
              <td className="py-2 pr-4 text-zinc-500 whitespace-nowrap">
                {log.createdAt.toLocaleString("it-IT")}
              </td>
              <td className="py-2 pr-4">{log.adminUser.email}</td>
              <td className="py-2 pr-4 font-mono">{log.action}</td>
              <td className="py-2 pr-4 text-zinc-500">{log.entityType}</td>
              <td className="py-2 text-zinc-400">{String(log.entityId)}</td>
            </tr>
          ))}
          {logs.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-zinc-400">Nessuna voce</td></tr>}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex gap-2 mt-4 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`px-3 py-1 rounded border ${p === currentPage ? "bg-zinc-900 text-white border-zinc-900" : "hover:bg-zinc-50 border-zinc-300"}`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
