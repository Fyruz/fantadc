import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST() {
  const date = new Date().toISOString().slice(0, 10);
  await db.siteVisit.upsert({
    where: { date },
    update: { count: { increment: 1 } },
    create: { date, count: 1 },
  });
  return NextResponse.json({ ok: true });
}
