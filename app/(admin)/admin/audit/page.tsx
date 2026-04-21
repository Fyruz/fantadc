import { db } from "@/lib/db";
import { getPaginationState } from "@/lib/pagination";
import AdminPageHeader from "@/components/admin-page-header";
import AuditTable from "./_table";

const PAGE_SIZE = 25;

type AuditPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuditPage({ searchParams }: AuditPageProps) {
  const { page } = await searchParams;
  const totalLogs = await db.adminAuditLog.count();
  const pagination = getPaginationState(page, totalLogs, PAGE_SIZE);

  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: pagination.skip,
    take: pagination.take,
    include: { adminUser: { select: { email: true } } },
  });

  const rows = logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toLocaleString("it-IT"),
    adminEmail: log.adminUser.email,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId ?? null,
  }));

  return (
    <div>
      <AdminPageHeader title="Audit log" />
      <AuditTable rows={rows} pagination={pagination} />
    </div>
  );
}
