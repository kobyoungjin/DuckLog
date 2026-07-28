import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isBookPageArray, flattenPostIds, flattenPhotocardIds } from "@/lib/book-pages";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((id) => typeof id === "string");
}

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

  const { bookTitle, pages } = body;

  if (!bookTitle || typeof bookTitle !== "string") {
    return NextResponse.json({ error: "bookTitle is required" }, { status: 400 });
  }

  let postIds: string[];
  let photocardIds: string[];

  if (pages !== undefined) {
    if (!isBookPageArray(pages)) {
      return NextResponse.json({ error: "Invalid pages structure" }, { status: 400 });
    }
    postIds = flattenPostIds(pages);
    photocardIds = flattenPhotocardIds(pages);
  } else {
    postIds = isStringArray(body.postIds) ? body.postIds : [];
    photocardIds = isStringArray(body.photocardIds) ? body.photocardIds : [];
  }

  if (postIds.length === 0 && photocardIds.length === 0) {
    return NextResponse.json(
      { error: "포함할 기록이나 포토카드를 하나 이상 선택해주세요." },
      { status: 400 }
    );
  }

  if (postIds.length > 0) {
    const matchingPosts = await prisma.post.count({ where: { id: { in: postIds } } });
    if (matchingPosts !== postIds.length) {
      return NextResponse.json({ error: "One or more postIds do not exist" }, { status: 400 });
    }
  }

  if (photocardIds.length > 0) {
    const matchingPhotocards = await prisma.photocard.count({
      where: { id: { in: photocardIds } },
    });
    if (matchingPhotocards !== photocardIds.length) {
      return NextResponse.json(
        { error: "One or more photocardIds do not exist" },
        { status: 400 }
      );
    }
  }

  const user = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      bookTitle,
      postIds,
      photocardIds,
      pages: pages ?? undefined,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
