import { prisma } from "@/lib/prisma";

const DEMO_NICKNAME = "guest";

/**
 * Auth is not implemented yet (Lv1 scope covers the post CRUD flow only).
 * Every request acts as a single shared demo user so Post.userId can be set;
 * replace this with real session lookup once auth lands.
 */
export async function getCurrentUser() {
  const existing = await prisma.user.findFirst({ where: { nickname: DEMO_NICKNAME } });
  if (existing) return existing;
  return prisma.user.create({ data: { nickname: DEMO_NICKNAME } });
}
