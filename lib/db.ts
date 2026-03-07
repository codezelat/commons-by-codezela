import { Pool } from "pg";

/**
 * Resolve the database connection string.
 * Set DB_PROVIDER=local  → uses DATABASE_URL_LOCAL  (default)
 * Set DB_PROVIDER=supabase → uses DATABASE_URL_SUPABASE
 * Falls back to DATABASE_URL if neither of the above is set.
 */
function getDatabaseUrl(): string {
  const provider = (process.env.DB_PROVIDER ?? "local").toLowerCase();
  if (provider === "supabase" && process.env.DATABASE_URL_SUPABASE) {
    return process.env.DATABASE_URL_SUPABASE;
  }
  if (provider === "local" && process.env.DATABASE_URL_LOCAL) {
    return process.env.DATABASE_URL_LOCAL;
  }
  // Fallback: bare DATABASE_URL (backward-compat)
  return process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL ?? "";
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
