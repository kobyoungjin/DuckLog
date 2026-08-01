import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const photocards = await prisma.photocard.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(photocards);
}

function clampPosition(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : fallback;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.imageUrl !== "string" || !body.imageUrl.trim()) {
    return NextResponse.json({ error: "이미지가 필요합니다." }, { status: 400 });
  }

  const user = await getCurrentUser();

  const photocard = await prisma.photocard.create({
    data: {
      userId: user.id,
      imageUrl: body.imageUrl.trim(),
      positionX: clampPosition(body.positionX, 50),
      positionY: clampPosition(body.positionY, 50),
      name: typeof body.name === "string" && body.name.trim() ? body.name.trim() : null,
      memo: typeof body.memo === "string" && body.memo.trim() ? body.memo.trim() : null,
    },
  });

  return NextResponse.json(photocard, { status: 201 });
}
