#!/usr/bin/env tsx
/**
 * db-seed.ts — Seed the admin user (info@codezela.com / password).
 *
 * Usage:
 *   npx tsx scripts/db-seed.ts
 *   DB_PROVIDER=supabase npx tsx scripts/db-seed.ts
 */

import dotenv from "dotenv";
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
    console.error("❌ No DATABASE_URL resolved. Check .env.local and DB_PROVIDER.");
    process.exit(1);
  }

  const provider = (process.env.DB_PROVIDER ?? "local").toLowerCase();
  console.log(`\n🌱 Seeding admin user on ${provider}...`);

  const pool = new Pool({ connectionString: url });

  try {
    // Check if admin already exists
    const existing = await pool.query(
      `SELECT id FROM "user" WHERE email = $1`,
      ["info@codezela.com"]
    );

    if (existing.rows.length > 0) {
      console.log("ℹ️  Admin user already exists, skipping.\n");
      return;
    }

    // Better Auth stores bcrypt hashes normally, but we'll call the
    // /api/seed endpoint instead for proper hashing. This script gives
    // you a CLI alternative that inserts via the running app.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log(`   Calling ${appUrl}/api/seed ...\n`);

    const res = await fetch(`${appUrl}/api/seed`, { method: "POST" });
    const data = await res.json();

    if (res.ok) {
      console.log("✅ " + (data.message || "Admin seeded"));
      console.log("   Email:    info@codezela.com");
      console.log("   Password: password\n");
    } else {
      console.error("❌ Seed failed:", data.error || data);
    }
  } catch (err) {
    console.error("❌ Seed failed:\n", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
