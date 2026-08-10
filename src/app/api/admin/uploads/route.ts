import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  MAX_UPLOAD_BYTES,
  isAllowedImageExtension,
  isAllowedImageMime,
  saveProductImageBuffer,
} from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart body" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowedImageMime(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, and AVIF images are allowed" },
      { status: 415 },
    );
  }

  if (!isAllowedImageExtension(file.name)) {
    return NextResponse.json(
      { error: "Invalid file extension. Use .jpg, .jpeg, .png, .webp, or .avif" },
      { status: 415 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json({ error: "Empty file" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const saved = await saveProductImageBuffer(buffer, file.type, file.name);
    return NextResponse.json({
      url: saved.url,
      width: saved.width,
      height: saved.height,
      bytes: saved.bytes,
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "upload_failed";
    const status =
      code === "too_large"
        ? 413
        : code === "unsupported_type" ||
            code === "unsupported_extension" ||
            code === "invalid_image" ||
            code === "empty_file"
          ? 400
          : 500;
    return NextResponse.json(
      {
        error:
          code === "invalid_image"
            ? "File is not a valid image"
            : code === "unsupported_extension"
              ? "Invalid file extension"
              : code === "too_large"
                ? "File too large (max 5 MB)"
                : "Upload failed",
      },
      { status },
    );
  }
}
