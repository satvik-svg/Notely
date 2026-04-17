import { prisma } from "./prisma";

export function computeBadge(karma: number): string {
  if (karma >= 1000) return "Gold Contributor";
  if (karma >= 500)  return "Silver Contributor";
  if (karma >= 100)  return "Rising Star";
  return "Newcomer";
}

// Call after karma updates
export async function refreshBadge(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { karma: true } });
  if (!user) return;
  await prisma.user.update({
    where: { id: userId },
    data: { badge: computeBadge(user.karma) },
  });
}
