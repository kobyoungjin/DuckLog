import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { bookTitle, postIds } = body;

  if (!bookTitle || typeof bookTitle !== "string") {
    return NextResponse.json({ error: "bookTitle is required" }, { status: 400 });
  }
  if (
    !Array.isArray(postIds) ||
    postIds.length === 0 ||
    !postIds.every((id: unknown) => typeof id === "string")
  ) {
    return NextResponse.json(
      { error: "postIds must be a non-empty array of strings" },
      { status: 400 }
    );
  }

  const matchingCount = await prisma.post.count({ where: { id: { in: postIds } } });
  if (matchingCount !== postIds.length) {
    return NextResponse.json({ error: "One or more postIds do not exist" }, { status: 400 });
  }

  const user = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      bookTitle,
      postIds,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
