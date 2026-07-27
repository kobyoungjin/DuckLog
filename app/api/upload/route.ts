import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "파일 크기는 10MB를 넘을 수 없습니다." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
  const filename = `${randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
