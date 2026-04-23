import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — check if note is favorited
export async function GET(req: Request, { params }: { params: Promise<{ noteId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ favorited: false });
  }

  const { noteId } = await params;
  const userId = (session.user as any).id;

  const existing = await prisma.favoriteNote.findUnique({
    where: { userId_noteId: { userId, noteId } },
  });

  return NextResponse.json({ favorited: !!existing });
}
