import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { CATEGORY_LIST } from "@/lib/category";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const month = searchParams.get("month"); // "YYYY-MM"

  const where: Record<string, unknown> = {};

  if (category) {
    if (!CATEGORY_LIST.includes(category as (typeof CATEGORY_LIST)[number])) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    where.category = category;
  }

  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid month, expected YYYY-MM" },
        { status: 400 }
      );
    }
    const year = Number(match[1]);
    const monthIndex = Number(match[2]) - 1;
    where.date = {
      gte: new Date(Date.UTC(year, monthIndex, 1)),
      lt: new Date(Date.UTC(year, monthIndex + 1, 1)),
    };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { category, title, content, date, images, metadata, layout } = body;

  if (!category || !CATEGORY_LIST.includes(category)) {
    return NextResponse.json({ error: "Invalid or missing category" }, { status: 400 });
  }
  if (!title || typeof title !== "string") {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!content || typeof content !== "string") {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (!date || Number.isNaN(Date.parse(date))) {
    return NextResponse.json({ error: "Valid date is required" }, { status: 400 });
  }

  const user = await getCurrentUser();

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      category,
      title,
      content,
      date: new Date(date),
      images: Array.isArray(images) ? images.filter((i) => typeof i === "string") : [],
      metadata: metadata ?? undefined,
      layout: layout ?? undefined,
    },
  });

  return NextResponse.json(post, { status: 201 });
}
