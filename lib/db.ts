import dns from "node:dns";
import { Pool } from "pg";

// Force IPv4 preference so hosts with AAAA records do not fail in IPv4-only runtimes.
dns.setDefaultResultOrder("ipv4first");

/**
 * Resolve the database connection string.
 * - DB_PROVIDER=local     → DATABASE_URL_LOCAL
 * - DB_PROVIDER=supabase  → DATABASE_URL_SUPABASE
 * - Production/Vercel defaults to non-local URLs first.
 * - Local development defaults to local URL first.
 */
function getDatabaseUrl(): string {
  const provider = process.env.DB_PROVIDER?.toLowerCase();

  if (provider === "supabase") {
    return process.env.DATABASE_URL_SUPABASE ?? process.env.DATABASE_URL ?? "";
  }
  if (provider === "local") {
    return process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL ?? "";
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return (
      process.env.DATABASE_URL ??
      process.env.DATABASE_URL_SUPABASE ??
      process.env.DATABASE_URL_LOCAL ??
      ""
    );
  }

  return (
    process.env.DATABASE_URL_LOCAL ??
    process.env.DATABASE_URL_SUPABASE ??
    process.env.DATABASE_URL ??
    ""
  );
}

const globalForDb = globalThis as unknown as { pool: Pool };

export const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: getDatabaseUrl(),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

export async function execute(
  text: string,
  params?: unknown[],
): Promise<number> {
  const result = await pool.query(text, params);
  return result.rowCount ?? 0;
}
