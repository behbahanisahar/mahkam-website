import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    // Fail faster when DB is unreachable instead of hanging the page
    transactionOptions: {
      maxWait: 3_000,
      timeout: 8_000,
    },
  });
}

function isClientCurrent(client: PrismaClient | undefined): client is PrismaClient {
  return Boolean(client && "productView" in client && client.productView);
}

const databaseUrl = process.env.DATABASE_URL ?? "";

// Recreate the client if DATABASE_URL changed (e.g. Neon → local Postgres)
if (
  globalForPrisma.prisma &&
  globalForPrisma.prismaUrl &&
  globalForPrisma.prismaUrl !== databaseUrl
) {
  void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
  globalForPrisma.prismaUrl = undefined;
}

export const prisma =
  isClientCurrent(globalForPrisma.prisma) && globalForPrisma.prismaUrl === databaseUrl
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaUrl = databaseUrl;
}

/** Run a DB query with a hard timeout so pages don't hang when Postgres is unreachable. */
export async function withDbTimeout<T>(
  promise: Promise<T>,
  ms = 8_000,
  fallback: T,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error("db_timeout")), ms);
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isTransientDbError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001 unreachable, P1002 timed out, P1017 server closed connection
    return ["P1001", "P1002", "P1017"].includes(error.code);
  }
  if (error instanceof Prisma.PrismaClientInitializationError) return true;
  const msg = error instanceof Error ? error.message : String(error);
  return /closed the connection|Can't reach database|timed out|ECONNRESET|ConnectionReset|db_timeout/i.test(
    msg,
  );
}

/** Retry briefly after pool drops. Keep attempts low so admin pages stay snappy. */
export async function withDbRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let last: unknown;
  for (let i = 0; i < attempts; i++) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (i > 0) {
        await prisma.$connect().catch(() => undefined);
        await new Promise((r) => setTimeout(r, 200 * i));
      }
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error("db_timeout")), 5_000);
        }),
      ]);
    } catch (error) {
      last = error;
      const transient =
        isTransientDbError(error) || (error instanceof Error && error.message === "db_timeout");
      if (!transient || i === attempts - 1) throw error;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  throw last;
}
