import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST — toggle favorite
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await req.json();
  if (!noteId) {
    return NextResponse.json({ error: "noteId required" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  // Check if already favorited
  const existing = await prisma.favoriteNote.findUnique({
    where: { userId_noteId: { userId, noteId } },
  });

  if (existing) {
    // Unfavorite
    await prisma.favoriteNote.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    // Favorite
    await prisma.favoriteNote.create({ data: { userId, noteId } });
    return NextResponse.json({ favorited: true });
  }
}

// GET — list user's favorite notes
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const favorites = await prisma.favoriteNote.findMany({
    where: { userId },
    include: {
      note: {
        include: {
          author: { select: { id: true, name: true, karma: true } },
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const notes = favorites.map((f) => f.note);
  return NextResponse.json({ notes });
}
