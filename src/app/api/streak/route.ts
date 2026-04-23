import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isYesterday(d1: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(d1, yesterday);
}

// GET — return streak data
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  return NextResponse.json(user);
}

// POST — record daily activity
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const today = new Date();
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

  let newStreak = user.currentStreak;

  if (last && isSameDay(last, today)) {
    // Already visited today, no change
    return NextResponse.json({
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      lastActiveDate: user.lastActiveDate,
      changed: false,
    });
  } else if (last && isYesterday(last, today)) {
    // Consecutive day — increment streak
    newStreak = user.currentStreak + 1;
  } else {
    // Streak broken or first visit
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  return NextResponse.json({ ...updated, changed: true });
}
