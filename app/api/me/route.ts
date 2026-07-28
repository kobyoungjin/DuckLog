import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

function toSafeUser(user: { id: string; nickname: string; createdAt: Date }) {
  return { id: user.id, nickname: user.nickname, createdAt: user.createdAt };
}

export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(toSafeUser(user));
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.nickname !== "string" || !body.nickname.trim()) {
    return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
  }

  const user = await getCurrentUser();

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { nickname: body.nickname.trim() },
  });

  return NextResponse.json(toSafeUser(updated));
}
