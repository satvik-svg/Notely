import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const groups = await prisma.studyGroup.findMany({
    where: { isPrivate: false },
    include: {
      _count: { select: { members: true, notes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(groups);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, subject, isPrivate, isClassGroup, section } = await req.json();

  const group = await prisma.studyGroup.create({
    data: {
      name,
      description,
      subject: subject || "General",
      isPrivate: isPrivate || false,
      isClassGroup: isClassGroup || false,
      section: isClassGroup ? section : null,
      members: {
        create: { userId: (session.user as any).id, role: "admin" },
      },
    },
  });

  return NextResponse.json(group, { status: 201 });
}

