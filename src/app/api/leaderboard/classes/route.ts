import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/leaderboard/classes — class vs class leaderboard
export async function GET() {
  // Get all users who have a section set
  const users = await prisma.user.findMany({
    where: { section: { not: null } },
    select: {
      section: true,
      karma: true,
      currentStreak: true,
      _count: { select: { notes: true, comments: true, upvotes: true } },
    },
  });

  // Aggregate by section
  const sectionMap: Record<string, {
    section: string;
    totalKarma: number;
    totalUploads: number;
    totalComments: number;
    totalUpvotes: number;
    memberCount: number;
    avgStreak: number;
    totalStreak: number;
  }> = {};

  for (const user of users) {
    const sec = user.section!;
    if (!sectionMap[sec]) {
      sectionMap[sec] = {
        section: sec,
        totalKarma: 0,
        totalUploads: 0,
        totalComments: 0,
        totalUpvotes: 0,
        memberCount: 0,
        avgStreak: 0,
        totalStreak: 0,
      };
    }
    sectionMap[sec].totalKarma += user.karma;
    sectionMap[sec].totalUploads += user._count.notes;
    sectionMap[sec].totalComments += user._count.comments;
    sectionMap[sec].totalUpvotes += user._count.upvotes;
    sectionMap[sec].memberCount += 1;
    sectionMap[sec].totalStreak += user.currentStreak;
  }

  const classes = Object.values(sectionMap)
    .map((c) => ({
      ...c,
      avgStreak: c.memberCount > 0 ? Math.round((c.totalStreak / c.memberCount) * 10) / 10 : 0,
      // Activity score: weighted combination
      activityScore: c.totalKarma + c.totalUploads * 10 + c.totalComments * 2 + c.totalUpvotes * 3,
    }))
    .sort((a, b) => b.activityScore - a.activityScore);

  return NextResponse.json(classes);
}
