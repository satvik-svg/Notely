import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { karma: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      karma: true,
      badge: true,
      department: true,
      section: true,
      currentStreak: true,
      _count: { select: { notes: true } },
    },
  });
  return NextResponse.json(users);
}
