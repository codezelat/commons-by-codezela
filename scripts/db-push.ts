#!/usr/bin/env tsx
/**
 * db-push.ts — Push the schema to the active database.
 *
 * Usage:
 *   npx tsx scripts/db-push.ts          # uses DB_PROVIDER from .env.local
 *   DB_PROVIDER=supabase npx tsx scripts/db-push.ts   # force Supabase
 *   DB_PROVIDER=local    npx tsx scripts/db-push.ts   # force local PG
 */

import dotenv from "dotenv";
import dns from "node:dns";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool, type PoolConfig } from "pg";

// Load .env.local (Next.js convention)
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });
dns.setDefaultResultOrder("ipv4first");

// ---- Resolve connection string (same logic as lib/db.ts) ----
function getDatabaseUrl(): string {
  const provider = process.env.DB_PROVIDER?.toLowerCase();
  if (provider === "supabase") {
    return (
      process.env.DATABASE_URL_SUPABASE_POOLER ??
      process.env.DATABASE_URL_SUPABASE ??
      process.env.DATABASE_URL ??
      ""
    );
  }
  if (provider === "local") {
    return process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL ?? "";
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return (
      process.env.DATABASE_URL ??
      process.env.DATABASE_URL_SUPABASE_POOLER ??
      process.env.DATABASE_URL_SUPABASE ??
      process.env.DATABASE_URL_LOCAL ??
      ""
    );
  }

  return (
    process.env.DATABASE_URL_LOCAL ??
    process.env.DATABASE_URL_SUPABASE_POOLER ??
    process.env.DATABASE_URL_SUPABASE ??
    process.env.DATABASE_URL ??
    ""
  );
}

function isSupabaseConnection(url: string): boolean {
  return /supabase\.(co|in)/i.test(url) || /db\.[^.]+\.supabase\.(co|in)/i.test(url);
}

function getPoolConfig(url: string): PoolConfig {
  if (isSupabaseConnection(url)) {
    return {
      connectionString: url,
      ssl: { rejectUnauthorized: false },
    };
  }
  return { connectionString: url };
}

async function main() {
  const url = getDatabaseUrl();
  if (!url) {
    console.error(
      "❌ No DATABASE_URL resolved. Check .env.local and DB_PROVIDER.",
    );
    process.exit(1);
  }

  const provider = (process.env.DB_PROVIDER ?? "local").toLowerCase();
  console.log(`\n🗄️  Target: ${provider}`);
  console.log(`   URL:    ${url.replace(/\/\/.*:.*@/, "//<credentials>@")}\n`);

  const pool = new Pool(getPoolConfig(url));

  try {
    // Read schema SQL
    const schemaPath = resolve(__dirname, "..", "lib", "schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");

    console.log("⏳ Running schema migration...\n");
    await pool.query(sql);
    console.log("✅ Schema pushed successfully!\n");
  } catch (err) {
    console.error("❌ Migration failed:\n", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("Tenant or user not found")) {
      console.error(
        "\nℹ️  Supabase rejected this URL.\n" +
          "   Use the exact Pooler connection string from Supabase Dashboard → Settings → Database.\n" +
          "   Then set DATABASE_URL_SUPABASE_POOLER in .env.local and rerun npm run db:push.",
      );
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
