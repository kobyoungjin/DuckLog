import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { id: string } };

export async function DELETE(_request: NextRequest, { params }: Params) {
  const existing = await prisma.photocard.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Photocard not found" }, { status: 404 });
  }

  await prisma.photocard.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
