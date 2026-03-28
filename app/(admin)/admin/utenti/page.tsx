import Link from "next/link";
import { db } from "@/lib/db";

export default async function UtentiPage() {
  const users = await db.user.findMany({
    orderBy: { id: "asc" },
    include: { fantasyTeam: { select: { id: true } } },
    omit: { passwordHash: true },
  });

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Utenti</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b text-left text-zinc-500">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Nome</th>
            <th className="py-2 pr-4">Ruolo</th>
            <th className="py-2 pr-4">Squadra fantasy</th>
            <th className="py-2 pr-4">Stato</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b hover:bg-zinc-50">
              <td className="py-2 pr-4">{u.email}</td>
              <td className="py-2 pr-4 text-zinc-500">{u.name ?? "—"}</td>
              <td className="py-2 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded ${u.role === "ADMIN" ? "bg-yellow-100 text-yellow-800" : "bg-zinc-100 text-zinc-600"}`}>
                  {u.role}
                </span>
              </td>
              <td className="py-2 pr-4 text-zinc-500">{u.fantasyTeam ? "Sì" : "No"}</td>
              <td className="py-2 pr-4">
                {u.isSuspended && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Sospeso</span>}
              </td>
              <td className="py-2">
                <Link href={`/admin/utenti/${u.id}`} className="text-blue-600 hover:underline">Dettaglio</Link>
              </td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-zinc-400">Nessun utente</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
