import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import {
    computeStrength,
    computeNextReviewAt,
    getPriority,
} from "@/lib/memory-strength";

const WEAKNESS_THRESHOLD = 0.4;

/**
 * POST /api/recall/refresh
 *
 * Batch recomputes memory strengths for all due items.
 * Designed to be called by Vercel Cron, GitHub Actions, or manually.
 * Protected by a simple Authorization header check.
 */
export async function POST(req: NextRequest) {
    // Simple auth: check for a shared secret or valid user session
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow if valid cron secret is provided
    const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

    if (!isCronAuth) {
        // Also allow authenticated users (for manual trigger)
        const { getServerSession } = await import("next-auth");
        const { authOptions } = await import("@/lib/auth");
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const now = new Date();

    // Fetch all due memories
    const dueMemories = await prisma.userConceptMemory.findMany({
        where: {
            nextReviewAt: { lte: now },
        },
        take: 500, // batch limit
    });

    if (dueMemories.length === 0) {
        return NextResponse.json({ refreshed: 0, notified: 0 });
    }

    // Group by userId for bulk notifications
    const userNotifications: Record<
        string,
        Array<{ noteChunkId: string; strength: number }>
    > = {};

    // Batch update
    for (const mem of dueMemories) {
        const currentStrength = computeStrength(mem.lastReviewedAt, now);
        const nextReview = computeNextReviewAt(currentStrength, now);

        await prisma.userConceptMemory.update({
            where: { id: mem.id },
            data: {
                strengthScore: currentStrength,
                nextReviewAt: nextReview,
            },
        });

        // Collect weak items for notification
        if (currentStrength < WEAKNESS_THRESHOLD) {
            if (!userNotifications[mem.userId]) {
                userNotifications[mem.userId] = [];
            }
            userNotifications[mem.userId].push({
                noteChunkId: mem.noteChunkId,
                strength: Math.round(currentStrength * 100) / 100,
            });
        }
    }

    // Send Pusher notifications per user
    let notifiedCount = 0;
    for (const [userId, weakItems] of Object.entries(userNotifications)) {
        // Enrich with note info for the notification payload
        const enriched = await Promise.all(
            weakItems.slice(0, 5).map(async (item) => {
                const chunk = await prisma.noteEmbedding.findUnique({
                    where: { id: item.noteChunkId },
                    select: {
                        chunk: true,
                        noteId: true,
                        note: { select: { title: true } },
                    },
                });
                return {
                    noteId: chunk?.noteId ?? null,
                    chunkPreview: (chunk?.chunk ?? "").slice(0, 80),
                    priority: getPriority(item.strength),
                };
            })
        );

        try {
            await pusherServer.trigger(`user-${userId}`, "review_due", {
                count: weakItems.length,
                items: enriched,
            });
            notifiedCount++;
        } catch (error) {
            console.error(`Failed to notify user ${userId}`, error);
        }
    }

    return NextResponse.json({
        refreshed: dueMemories.length,
        notified: notifiedCount,
    });
}
