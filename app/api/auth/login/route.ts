import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureAdminUser, signSession, verifyPassword, SESSION_COOKIE } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  await ensureAdminUser();

  const user = await prisma.user.findUnique({ where: { email: body.email } });

  if (!user || !user.passwordHash || user.role !== "ADMIN") {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const valid = await verifyPassword(body.password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const token = await signSession({ userId: user.id, email: user.email!, role: user.role });

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}
