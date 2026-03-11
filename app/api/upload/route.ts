import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { getLocalUploadDir, getLocalUploadPath, getLocalUploadUrl } from "@/lib/local-upload";
import {
  enforceRateLimit,
  getClientIpFromHeaders,
  RateLimitError,
} from "@/lib/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

/** Check whether R2 env vars are configured */
function getR2ConfigState() {
  const hasCoreCredentials = !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );

  const hasPublicUrl = !!process.env.R2_PUBLIC_URL;
  return {
    enabled: hasCoreCredentials && hasPublicUrl,
    hasCoreCredentials,
    hasPublicUrl,
  };
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIpFromHeaders(
    request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
  );
  const actorKey = session.user.id || clientIp;
  try {
    await enforceRateLimit({
      key: `upload:file:minute:${actorKey}`,
      limit: 25,
      windowSeconds: 60,
    });
    await enforceRateLimit({
      key: `upload:file:hour:${actorKey}`,
      limit: 250,
      windowSeconds: 60 * 60,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        },
      );
    }
    throw error;
  }

  try {
    const r2 = getR2ConfigState();
    if (r2.hasCoreCredentials && !r2.hasPublicUrl) {
      return NextResponse.json(
        {
          error:
            "R2 is partially configured. Set R2_PUBLIC_URL (custom domain or R2 public development URL) to serve uploaded files.",
        },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF, SVG" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (r2.enabled) {
      // Production: upload to Cloudflare R2
      const { uploadFile } = await import("@/lib/r2");
      const result = await uploadFile(buffer, file.type, "images");
      return NextResponse.json({ url: result.url, key: result.key });
    }

    // Local dev fallback: save to public/uploads
    const ext = file.type.split("/")[1]?.replace("svg+xml", "svg") || "bin";
    const filename = `${randomUUID()}.${ext}`;
    await mkdir(getLocalUploadDir(), { recursive: true });
    await writeFile(getLocalUploadPath(filename), buffer);

    return NextResponse.json({
      url: getLocalUploadUrl(filename),
      key: `uploads/${filename}`,
    });
  } catch (e) {
    console.error("[Upload]", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
