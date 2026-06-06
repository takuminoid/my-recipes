import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Stored outside public/ so it works in dev (Turbopack) and prod (next start).
// Files are served back via the GET /api/uploads/[name] route handler.
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file = data.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
  }

  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ error: "画像ファイルを選んでください" }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "画像は8MBまでです" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json({ url: `/api/uploads/${filename}` }, { status: 201 });
}
