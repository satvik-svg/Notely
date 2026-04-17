import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    computeStrength,
    updateStrength,
    computeNextReviewAt,
    type MemoryEvent,
} from "@/lib/memory-strength";

const VALID_EVENTS = new Set<MemoryEvent>([
    "correct",
    "wrong",
    "chat_review",
    "passive_view",
]);

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const event = body?.event as MemoryEvent | undefined;
    const noteChunkId = body?.noteChunkId as string | undefined;
    const noteId = body?.noteId as string | undefined;

    if (!event || !VALID_EVENTS.has(event)) {
        return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    // If only noteId is provided (e.g. from MCQQuiz), find all chunk IDs for the note
    let chunkIds: string[] = [];

    if (noteChunkId) {
        chunkIds = [noteChunkId];
    } else if (noteId) {
        const embeddings = await prisma.noteEmbedding.findMany({
            where: { noteId },
            select: { id: true },
            take: 20,
        });
        chunkIds = embeddings.map((e) => e.id);
    }

    if (chunkIds.length === 0) {
        return NextResponse.json({ error: "No chunks found" }, { status: 400 });
    }

    const now = new Date();
    const results = [];

    for (const chunkId of chunkIds) {
        // Find existing memory record
        const existing = await prisma.userConceptMemory.findFirst({
            where: { userId, noteChunkId: chunkId },
        });

        if (existing) {
            // Recompute current decay, then apply event
            const decayed = computeStrength(existing.lastReviewedAt, now);
            const newStrength = updateStrength(decayed, event);
            const nextReview = computeNextReviewAt(newStrength, now);

            const updated = await prisma.userConceptMemory.update({
                where: { id: existing.id },
                data: {
                    strengthScore: newStrength,
                    lastReviewedAt: now,
                    nextReviewAt: nextReview,
                },
            });
            results.push(updated);
        } else {
            // Create new memory record
            const baseStrength = updateStrength(0.5, event);
            const nextReview = computeNextReviewAt(baseStrength, now);

            const created = await prisma.userConceptMemory.create({
                data: {
                    userId,
                    noteChunkId: chunkId,
                    strengthScore: baseStrength,
                    lastReviewedAt: now,
                    nextReviewAt: nextReview,
                },
            });
            results.push(created);
        }
    }

    return NextResponse.json({
        tracked: results.length,
        event,
    });
}
