import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { getLocalUploadDir, getLocalUploadPath, getLocalUploadUrl } from "@/lib/local-upload";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 15_000;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

/**
 * SSRF guard — rejects private/loopback/link-local IPs and non-http(s) schemes.
 * NOTE: this is a best-effort parse-time check.  Full protection requires
 * resolving the hostname after the TCP connection (not possible in standard
 * fetch/Node).  Keep this layer + restrict outbound networking in production.
 */
function isSafeUrl(raw: string): { safe: boolean; reason?: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { safe: false, reason: "Invalid URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { safe: false, reason: "URL must use http or https" };
  }

  const hostname = url.hostname.toLowerCase();

  // Block well-known dangerous hostnames
  const blockedHostnames = [
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "169.254.169.254", // AWS/GCP/Azure IMDS
    "metadata.google.internal",
    "metadata.internal",
  ];
  if (blockedHostnames.includes(hostname)) {
    return { safe: false, reason: "URL points to a restricted address" };
  }

  // Block private IPv4 ranges
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number);
    const isPrivate =
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8
      (a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 CGN
      a === 127 || // 127.0.0.0/8 loopback
      (a === 169 && b === 254) || // 169.254.0.0/16 link-local / IMDS
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      a >= 224; // multicast + reserved
    if (isPrivate) {
      return { safe: false, reason: "URL points to a restricted address" };
    }
  }

  return { safe: true };
}

function isR2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );
}

export async function POST(request: NextRequest) {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const rawUrl = (body.url ?? "").trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  const { safe, reason } = isSafeUrl(rawUrl);
  if (!safe) {
    return NextResponse.json({ error: reason }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(rawUrl, {
      signal: controller.signal,
      headers: { Accept: "image/*,*/*;q=0.8" },
      redirect: "follow",
    });
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not fetch image (HTTP ${res.status})` },
        { status: 400 },
      );
    }

    // Validate content-type
    const contentType =
      res.headers.get("content-type")?.split(";")[0].trim() ?? "";
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error:
            "URL does not point to a supported image type (JPEG, PNG, WebP, GIF, SVG)",
        },
        { status: 400 },
      );
    }

    // Stream body with a hard size cap — never buffer more than MAX_SIZE
    const reader = res.body?.getReader();
    if (!reader) {
      return NextResponse.json(
        { error: "Empty response from URL" },
        { status: 400 },
      );
    }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_SIZE) {
        reader.cancel();
        return NextResponse.json(
          { error: "Image is too large. Maximum allowed size is 5 MB." },
          { status: 400 },
        );
      }
      chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map((c) => Buffer.from(c)));

    // Save to R2 (prod) or a local upload directory served through a route (dev)
    if (isR2Configured()) {
      const { uploadFile } = await import("@/lib/r2");
      const result = await uploadFile(buffer, contentType, "images");
      return NextResponse.json({ url: result.url, key: result.key });
    }

    const ext = contentType.split("/")[1]?.replace("svg+xml", "svg") || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    await mkdir(getLocalUploadDir(), { recursive: true });
    await writeFile(getLocalUploadPath(filename), buffer);

    return NextResponse.json({
      url: getLocalUploadUrl(filename),
      key: `uploads/${filename}`,
    });
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: "Timed out fetching the image URL" },
        { status: 400 },
      );
    }
    console.error("[Upload URL]", e);
    return NextResponse.json(
      { error: "Failed to fetch and save image" },
      { status: 500 },
    );
  }
}
