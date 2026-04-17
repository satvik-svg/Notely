import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const noteId = id;
  const userId = (session.user as any).id;

  // Check if already upvoted
  const existing = await prisma.upvote.findUnique({
    where: { userId_noteId: { userId, noteId } },
  });

  if (existing) {
    // Toggle off — remove upvote
    await prisma.upvote.delete({ where: { userId_noteId: { userId, noteId } } });
    await prisma.note.update({ where: { id: noteId }, data: { upvoteCount: { decrement: 1 } } });
    return NextResponse.json({ upvoted: false });
  } else {
    // Add upvote
    await prisma.upvote.create({ data: { userId, noteId } });
    await prisma.note.update({ where: { id: noteId }, data: { upvoteCount: { increment: 1 } } });

    // Give karma to note author
    const note = await prisma.note.findUnique({ where: { id: noteId }, select: { authorId: true } });
    if (note && note.authorId !== userId) {
      await prisma.user.update({
        where: { id: note.authorId },
        data: { karma: { increment: 5 } },
      });
    }
    return NextResponse.json({ upvoted: true });
  }
}
