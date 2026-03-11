#!/usr/bin/env tsx
/**
 * db-seed.ts — Seed the admin user (info@codezela.com / password).
 *
 * Usage:
 *   npx tsx scripts/db-seed.ts
 *   DB_PROVIDER=supabase npx tsx scripts/db-seed.ts
 */

import dotenv from "dotenv";
import dns from "node:dns";
import { resolve } from "path";
import { Pool, type PoolConfig } from "pg";

dotenv.config({ path: resolve(__dirname, "..", ".env.local") });
dns.setDefaultResultOrder("ipv4first");

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

async function seedViaApiRoute() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const seedUrl = `${appUrl.replace(/\/$/, "")}/api/seed`;
  console.log(`   Falling back to ${seedUrl}`);

  const res = await fetch(seedUrl, { method: "POST" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data?.error === "string"
        ? data.error
        : `Seed API failed with status ${res.status}`,
    );
  }
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
  console.log(`\n🌱 Seeding admin user on ${provider}...`);

  const pool = new Pool(getPoolConfig(url));

  try {
    // Check if admin already exists
    const existing = await pool.query(
      `SELECT id FROM "user" WHERE email = $1`,
      ["info@codezela.com"],
    );

    if (existing.rows.length > 0) {
      console.log("ℹ️  Admin user already exists, skipping.\n");
      return;
    }

    try {
      const { auth } = await import("../lib/auth");
      const result = await auth.api.signUpEmail({
        body: {
          name: "Codezela Admin",
          email: "info@codezela.com",
          password: "password",
        },
      });

      if (!result?.user?.id) {
        throw new Error("Admin sign-up did not return a user id.");
      }

      await pool.query(
        `UPDATE "user"
         SET role = 'admin', "emailVerified" = TRUE
         WHERE id = $1`,
        [result.user.id],
      );
    } catch (seedError) {
      const message = seedError instanceof Error ? seedError.message : String(seedError);
      if (message.includes("Cannot find module 'server-only'")) {
        await seedViaApiRoute();
      } else {
        throw seedError;
      }
    }

    console.log("✅ Admin user seeded");
    console.log("   Email:    info@codezela.com");
    console.log("   Password: password\n");
  } catch (err) {
    console.error("❌ Seed failed:\n", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
