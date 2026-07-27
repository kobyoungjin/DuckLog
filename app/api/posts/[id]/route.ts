import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LIST } from "@/lib/category";

type Params = { params: { id: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { category, title, content, date, images, metadata, layout } = body;

  if (category !== undefined && !CATEGORY_LIST.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (date !== undefined && Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  const post = await prisma.post.update({
    where: { id: params.id },
    data: {
      ...(category !== undefined ? { category } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(images !== undefined
        ? { images: Array.isArray(images) ? images.filter((i: unknown) => typeof i === "string") : [] }
        : {}),
      ...(metadata !== undefined ? { metadata } : {}),
      ...(layout !== undefined ? { layout } : {}),
    },
  });

  return NextResponse.json(post);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const existing = await prisma.post.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  await prisma.post.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
