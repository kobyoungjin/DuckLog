import { prisma } from "@/lib/prisma";

const DEMO_NICKNAME = "guest";

/**
 * This is a single-user personal app with no login — every request acts as
 * one shared demo user so Post/Order/Photocard.userId can be set.
 */
export async function getCurrentUser() {
  const existing = await prisma.user.findFirst({ where: { nickname: DEMO_NICKNAME } });
  if (existing) return existing;
  return prisma.user.create({ data: { nickname: DEMO_NICKNAME } });
}
