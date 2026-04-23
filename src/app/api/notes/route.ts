import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { indexNote } from "@/lib/index-note";

// GET /api/notes?subject=CS&tag=DBMS&q=query&page=1&isPYQ=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const page = parseInt(searchParams.get("page") ?? "1");
  const isPYQ = searchParams.get("isPYQ");
  const examYear = searchParams.get("examYear");
  const PAGE_SIZE = 12;

  const notes = await prisma.note.findMany({
    where: {
      isPublic: true,
      ...(subject && subject !== "All" ? { subject } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(isPYQ === "true" ? { isPYQ: true } : {}),
      ...(examYear ? { examYear: parseInt(examYear) } : {}),
    },
    include: {
      author: { select: { id: true, name: true, karma: true } },
      _count: { select: { comments: true } },
    },
    orderBy: { upvoteCount: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return NextResponse.json({ notes });
}

// POST /api/notes — create a new note
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    fileUrl: z.string().url(),
    fileType: z.enum(["pdf", "image", "text"]),
    subject: z.string(),
    tags: z.array(z.string()).max(5),
    groupId: z.string().optional(),
    isPYQ: z.boolean().optional(),
    examYear: z.number().optional(),
    examType: z.string().optional(),
  });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const note = await prisma.note.create({
    data: { ...parsed.data, authorId: (session.user as any).id },
  });

  // Trigger indexing in background
  indexNote(note.id, note.fileUrl).catch(console.error);

  // Give karma to uploader
  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { karma: { increment: 10 } },
  });

  return NextResponse.json(note, { status: 201 });
}
