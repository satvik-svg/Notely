import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json(); // needed only for private groups
  const { id } = await params;
  const group = await prisma.studyGroup.findUnique({ where: { id } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (group.isPrivate && group.inviteCode !== inviteCode) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 403 });
  }

  const userId = (session.user as any).id;

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId: id } },
    create: { userId, groupId: id },
    update: {},
  });

  return NextResponse.json({ joined: true });
}
