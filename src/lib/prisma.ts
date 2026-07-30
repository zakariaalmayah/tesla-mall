import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — prevents exhausting the Supabase connection pool
 * from hot-reloaded module instances in development.
 *
 * connection_limit=5  : allows up to 5 concurrent queries (safe for Supabase free tier)
 * pool_timeout=20     : wait up to 20 s for a free slot before throwing P2024
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  // Ensure pool params are present even if the .env value is missing them
  const datasourceUrl =
    url && !url.includes("connection_limit")
      ? `${url}${url.includes("?") ? "&" : "?"}connection_limit=5&pool_timeout=20`
      : url;

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
    datasourceUrl,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
