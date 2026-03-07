#!/usr/bin/env tsx
/**
 * db-reset.ts — Drop all project tables and re-run the schema.
 * ⚠ DESTRUCTIVE — only use this in development!
 *
 * Usage:
 *   npx tsx scripts/db-reset.ts
 */

import dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";
import { Pool } from "pg";

dotenv.config({ path: resolve(__dirname, "..", ".env.local") });

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
    console.error("❌ No DATABASE_URL resolved.");
    process.exit(1);
  }

  const provider = (process.env.DB_PROVIDER ?? "local").toLowerCase();

  if (provider === "supabase") {
    console.error(
      "🛑 Refusing to reset a Supabase database. Set DB_PROVIDER=local.",
    );
    process.exit(1);
  }

  console.log(`\n⚠️  Resetting LOCAL database...`);
  console.log(`   URL: ${url.replace(/\/\/.*:.*@/, "//<credentials>@")}\n`);

  const pool = new Pool({ connectionString: url });

  try {
    // Drop tables in correct order (respecting FK constraints)
    const dropSql = `
      DROP TABLE IF EXISTS article_tag CASCADE;
      DROP TABLE IF EXISTS article CASCADE;
      DROP TABLE IF EXISTS tag CASCADE;
      DROP TABLE IF EXISTS category CASCADE;
      DROP TABLE IF EXISTS verification CASCADE;
      DROP TABLE IF EXISTS account CASCADE;
      DROP TABLE IF EXISTS session CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
    `;
    await pool.query(dropSql);
    console.log("🗑️  Tables dropped.");

    // Re-run schema
    const schemaPath = resolve(__dirname, "..", "lib", "schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");
    await pool.query(sql);
    console.log("✅ Schema re-created successfully!\n");
  } catch (err) {
    console.error("❌ Reset failed:\n", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
