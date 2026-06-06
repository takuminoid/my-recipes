import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // Only allow a plain "<uuid>.<ext>" filename — no path traversal.
  if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/i.test(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = name.split(".").pop()!.toLowerCase();
  try {
    const file = await readFile(path.join(UPLOAD_DIR, name));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": TYPE_BY_EXT[ext],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
