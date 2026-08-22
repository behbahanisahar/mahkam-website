import { NextRequest, NextResponse } from "next/server";
import { logAppError } from "@/lib/errors/log";

const recent = new Map<string, number>();

function rateLimited(key: string, windowMs = 15_000) {
  const now = Date.now();
  const last = recent.get(key) ?? 0;
  if (now - last < windowMs) return true;
  recent.set(key, now);
  if (recent.size > 500) {
    for (const [k, t] of recent) {
      if (now - t > windowMs * 4) recent.delete(k);
    }
  }
  return false;
}

/** Public endpoint used by error UI / offline page to report failures. */
export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json({ ok: true, skipped: "rate" });
    }

    const body = (await req.json().catch(() => ({}))) as {
      level?: "error" | "warning" | "offline";
      source?: "client" | "server" | "gateway" | "unknown";
      statusCode?: number;
      message?: string;
      digest?: string;
      path?: string;
      stack?: string;
      meta?: Record<string, unknown>;
    };

    const message = String(body.message ?? "").trim();
    if (!message || message.length < 3) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const id = await logAppError({
      level: body.level ?? "error",
      source: body.source ?? "client",
      statusCode: body.statusCode ?? null,
      message,
      digest: body.digest ?? null,
      path: body.path ?? req.headers.get("referer"),
      userAgent: req.headers.get("user-agent"),
      stack: body.stack ?? null,
      meta: body.meta ?? null,
    });

    return NextResponse.json({ ok: true, id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
