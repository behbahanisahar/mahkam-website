import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type LogAppErrorInput = {
  level?: "error" | "warning" | "offline";
  source?: "client" | "server" | "gateway" | "unknown";
  statusCode?: number | null;
  message: string;
  digest?: string | null;
  path?: string | null;
  userAgent?: string | null;
  stack?: string | null;
  meta?: Record<string, unknown> | null;
};

function clip(value: string | null | undefined, max: number) {
  if (!value) return null;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Persist an error for the admin panel. Never throws to callers. */
export async function logAppError(input: LogAppErrorInput): Promise<string | null> {
  try {
    const message = clip(input.message.trim() || "Unknown error", 500);
    if (!message) return null;

    const row = await prisma.appErrorLog.create({
      data: {
        level: input.level ?? "error",
        source: input.source ?? "unknown",
        statusCode: input.statusCode ?? null,
        message,
        digest: clip(input.digest, 120),
        path: clip(input.path, 400),
        userAgent: clip(input.userAgent, 400),
        stack: clip(input.stack, 4000),
        meta: input.meta
          ? (input.meta as Prisma.InputJsonValue)
          : undefined,
      },
      select: { id: true },
    });
    return row.id;
  } catch (e) {
    console.error("[logAppError] failed", e);
    return null;
  }
}
