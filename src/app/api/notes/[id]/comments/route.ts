import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { noteId: id, parentId: null }, // top-level only
    include: {
      author: { select: { id: true, name: true, karma: true } },
      replies: {
        include: { author: { select: { id: true, name: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { text, parentId } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Empty comment" }, { status: 400 });

  const { id } = await params;
  const comment = await prisma.comment.create({
    data: { text, noteId: id, authorId: (session.user as any).id, parentId: parentId ?? null },
    include: { author: { select: { id: true, name: true } } },
  });

  // Trigger Pusher
  await pusherServer.trigger(`note-${id}`, "new-comment", {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    author: {
      id: comment.author.id,
      name: comment.author.name,
    },
  });

  // Small karma for commenting
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { karma: { increment: 2 } },
  });

  return NextResponse.json(comment, { status: 201 });
}
