#!/usr/bin/env tsx
/**
 * r2-check.ts — Validate Cloudflare R2 credentials and public URL wiring.
 *
 * Usage:
 *   npx tsx scripts/r2-check.ts
 */

import dotenv from "dotenv";
import { resolve } from "path";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

dotenv.config({ path: resolve(__dirname, "..", ".env.local") });

const accountId = process.env.R2_ACCOUNT_ID || "";
const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
const bucket = process.env.R2_BUCKET_NAME || "";
const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

function fail(message: string): never {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function requireEnv(name: string, value: string) {
  if (!value) {
    fail(`Missing ${name} in .env.local`);
  }
}

async function main() {
  requireEnv("R2_ACCOUNT_ID", accountId);
  requireEnv("R2_ACCESS_KEY_ID", accessKeyId);
  requireEnv("R2_SECRET_ACCESS_KEY", secretAccessKey);
  requireEnv("R2_BUCKET_NAME", bucket);

  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  const key = `healthcheck/${randomUUID()}.txt`;
  const body = Buffer.from(`commons-r2-check ${new Date().toISOString()}`);

  console.log(`\n🔎 Checking R2 bucket: ${bucket}`);
  console.log(`   Endpoint: ${endpoint}\n`);

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log("✅ Bucket access ok");

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: "text/plain",
      }),
    );
    console.log(`✅ Upload ok (${key})`);
  } catch (error) {
    fail(`R2 API check failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!publicUrl) {
    console.warn(
      "⚠️  R2_PUBLIC_URL is empty. Uploads can succeed but public image URLs will not work.\n" +
        "   Set R2_PUBLIC_URL to a custom domain or the R2 public development URL.",
    );
  } else {
    const objectUrl = `${publicUrl}/${key}`;
    try {
      const res = await fetch(objectUrl, { method: "HEAD" });
      if (!res.ok) {
        console.warn(
          `⚠️  Public URL check failed (${res.status}) for ${objectUrl}\n` +
            "   Ensure the bucket/domain is publicly readable and correctly mapped.",
        );
      } else {
        console.log(`✅ Public URL ok (${objectUrl})`);
      }
    } catch (error) {
      console.warn(
        `⚠️  Public URL check failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  try {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log("✅ Cleanup ok (test object deleted)\n");
  } catch (error) {
    console.warn(
      `⚠️  Could not delete test object ${key}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

main();
