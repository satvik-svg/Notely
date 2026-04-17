import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeStrength, getPriority } from "@/lib/memory-strength";

export async function GET() {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Fetch due memories (nextReviewAt <= now)
    const memories = await prisma.userConceptMemory.findMany({
        where: {
            userId,
            nextReviewAt: { lte: now },
        },
        orderBy: { strengthScore: "asc" },
        take: 20,
    });

    // Enrich with chunk text + note info
    const items = await Promise.all(
        memories.map(async (mem) => {
            const chunk = await prisma.noteEmbedding.findUnique({
                where: { id: mem.noteChunkId },
                select: {
                    chunk: true,
                    noteId: true,
                    note: { select: { title: true, subject: true } },
                },
            });

            const currentStrength = computeStrength(mem.lastReviewedAt, now);
            const priority = getPriority(currentStrength);

            return {
                id: mem.id,
                noteChunkId: mem.noteChunkId,
                noteId: chunk?.noteId ?? null,
                noteTitle: chunk?.note?.title ?? "Unknown",
                noteSubject: chunk?.note?.subject ?? "",
                chunkPreview: (chunk?.chunk ?? "").slice(0, 120),
                strengthScore: Math.round(currentStrength * 100) / 100,
                priority,
                lastReviewedAt: mem.lastReviewedAt,
                nextReviewAt: mem.nextReviewAt,
            };
        })
    );

    // Group by priority
    const critical = items.filter((i) => i.priority === "critical");
    const due = items.filter((i) => i.priority === "due");
    const strong = items.filter((i) => i.priority === "strong");

    return NextResponse.json({
        total: items.length,
        critical,
        due,
        strong,
    });
}
