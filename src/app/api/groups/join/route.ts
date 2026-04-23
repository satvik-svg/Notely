import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/groups/join — join a group by invite code
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  const group = await prisma.studyGroup.findUnique({ where: { inviteCode } });
  if (!group) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  const userId = (session.user as any).id;

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId, groupId: group.id } },
    create: { userId, groupId: group.id },
    update: {},
  });

  return NextResponse.json({ joined: true, groupId: group.id, groupName: group.name });
}
