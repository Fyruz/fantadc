import { db } from "@/lib/db";
import { getPaginationState } from "@/lib/pagination";
import UtentiTable from "./_table";
import AdminPageHeader from "@/components/admin-page-header";

const PAGE_SIZE = 15;

type UtentiPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UtentiPage({ searchParams }: UtentiPageProps) {
  const { page } = await searchParams;
  const totalUsers = await db.user.count();
  const pagination = getPaginationState(page, totalUsers, PAGE_SIZE);

  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    skip: pagination.skip,
    take: pagination.take,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isSuspended: true,
      fantasyTeam: { select: { id: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title="Utenti" />
      <UtentiTable rows={users} pagination={pagination} />
    </div>
  );
}
