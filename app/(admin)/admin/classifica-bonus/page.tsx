import { db } from "@/lib/db";
import AdminPageHeader from "@/components/admin-page-header";
import BonusMalusTables from "./_tables";
export const dynamic = "force-dynamic";

export default async function ClassificaBonusPage() {
  const [assignments, bonusTypes] = await Promise.all([
    db.playerMatchBonus.findMany({
      include: {
        player: {
          select: { id: true, name: true, role: true, footballTeam: { select: { name: true } } },
        },
        bonusType: { select: { id: true, points: true } },
      },
    }),
    db.bonusType.findMany({ orderBy: { code: "asc" } }),
  ]);

  const byPlayerAndType = new Map<
    string,
    { playerId: number; name: string; role: string; teamName: string; bonusTypeId: number; quantity: number }
  >();

  for (const a of assignments) {
    const key = `${a.player.id}-${a.bonusType.id}`;
    const entry = byPlayerAndType.get(key);
    if (entry) {
      entry.quantity += a.quantity;
    } else {
      byPlayerAndType.set(key, {
        playerId: a.player.id,
        name: a.player.name,
        role: a.player.role,
        teamName: a.player.footballTeam.name,
        bonusTypeId: a.bonusType.id,
        quantity: a.quantity,
      });
    }
  }

  const rows = Array.from(byPlayerAndType.values());
  const types = bonusTypes.map((bt) => ({
    id: bt.id,
    code: bt.code,
    name: bt.name,
    points: Number(bt.points),
  }));

  return (
    <div>
      <AdminPageHeader title="Classifica bonus/malus" />
      <BonusMalusTables rows={rows} bonusTypes={types} />
    </div>
  );
}
