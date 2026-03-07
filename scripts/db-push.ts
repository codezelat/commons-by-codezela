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
import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

// Load .env.local (Next.js convention)
dotenv.config({ path: resolve(__dirname, "..", ".env.local") });

// ---- Resolve connection string (same logic as lib/db.ts) ----
function getDatabaseUrl(): string {
  const provider = (process.env.DB_PROVIDER ?? "local").toLowerCase();
  if (provider === "supabase" && process.env.DATABASE_URL_SUPABASE) {
    return process.env.DATABASE_URL_SUPABASE;
  }
  if (provider === "local" && process.env.DATABASE_URL_LOCAL) {
    return process.env.DATABASE_URL_LOCAL;
  }
  return process.env.DATABASE_URL ?? process.env.DATABASE_URL_LOCAL ?? "";
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

  const pool = new Pool({ connectionString: url });

  try {
    // Read schema SQL
    const schemaPath = resolve(__dirname, "..", "lib", "schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");

    console.log("⏳ Running schema migration...\n");
    await pool.query(sql);
    console.log("✅ Schema pushed successfully!\n");
  } catch (err) {
    console.error("❌ Migration failed:\n", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
