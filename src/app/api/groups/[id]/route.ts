import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

// GET — fetch group details + messages
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const group = await prisma.studyGroup.findUnique({
    where: { id },
    include: {
      _count: { select: { members: true, notes: true } },
      members: {
        include: { user: { select: { id: true, name: true, karma: true, section: true } } },
        orderBy: { joinedAt: "asc" },
      },
      notes: {
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      messages: {
        include: {
          author: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  });

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  return NextResponse.json(group);
}

// POST — send message to group chat
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  // Check if user is a member
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId, groupId: id } },
  });

  if (!membership) {
    return NextResponse.json({ error: "You must join this group first" }, { status: 403 });
  }

  const message = await prisma.groupMessage.create({
    data: {
      text: text.trim(),
      authorId: userId,
      groupId: id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  // Push real-time
  try {
    await pusherServer.trigger(`group-${id}`, "new-message", message);
  } catch (e) {
    console.error("Pusher trigger failed", e);
  }

  return NextResponse.json(message, { status: 201 });
}
