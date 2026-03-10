import "server-only";

import { createHash } from "crypto";
import { execute, queryOne } from "@/lib/db";

export class RateLimitError extends Error {
  retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

function getBucketStart(windowSeconds: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const bucketSeconds = Math.floor(nowSeconds / windowSeconds) * windowSeconds;
  return new Date(bucketSeconds * 1000).toISOString();
}

function getHashedKey(rawKey: string): string {
  return createHash("sha256").update(rawKey).digest("hex");
}

async function cleanupOldBuckets() {
  if (Math.random() > 0.02) {
    return;
  }
  await execute(
    `DELETE FROM rate_limit_bucket
     WHERE bucket_start < NOW() - INTERVAL '3 days'`,
  );
}

export async function enforceRateLimit(options: RateLimitOptions): Promise<void> {
  const limit = Math.max(1, Math.floor(options.limit));
  const windowSeconds = Math.max(1, Math.floor(options.windowSeconds));
  const rateKey = getHashedKey(options.key);
  const bucketStart = getBucketStart(windowSeconds);

  await cleanupOldBuckets();

  const result = await queryOne<{ count: number }>(
    `INSERT INTO rate_limit_bucket (rate_key, bucket_start, count, updated_at)
     VALUES ($1, $2, 1, NOW())
     ON CONFLICT (rate_key, bucket_start)
     DO UPDATE
       SET count = rate_limit_bucket.count + 1,
           updated_at = NOW()
     RETURNING count`,
    [rateKey, bucketStart],
  );

  const count = Number(result?.count || 0);
  if (count <= limit) {
    return;
  }

  const nowMs = Date.now();
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((new Date(bucketStart).getTime() + windowSeconds * 1000 - nowMs) / 1000),
  );

  throw new RateLimitError("Too many requests. Please try again later.", retryAfterSeconds);
}

export function getClientIpFromHeaders(
  headerValue: string | null | undefined,
): string {
  if (!headerValue) {
    return "unknown";
  }
  const first = headerValue.split(",")[0]?.trim();
  return first || "unknown";
}
