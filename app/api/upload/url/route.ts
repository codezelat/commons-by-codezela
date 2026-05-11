import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomUUID } from "crypto";
import dns from "node:dns/promises";
import net from "node:net";
import { writeFile, mkdir } from "fs/promises";
import { getLocalUploadDir, getLocalUploadPath, getLocalUploadUrl } from "@/lib/local-upload";
import {
  enforceRateLimit,
  getClientIpFromHeaders,
  RateLimitError,
} from "@/lib/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const FETCH_TIMEOUT_MS = 15_000;

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const FILE_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "image/gif": [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
  ],
};

function parseUploadUrl(raw: string): { url?: URL; error?: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "Invalid URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "URL must use http or https" };
  }

  return { url };
}

function isBlockedHostname(hostname: string) {
  const normalized = hostname.toLowerCase();
  return [
    "localhost",
    "metadata.google.internal",
    "metadata.internal",
  ].includes(normalized);
}

function isPrivateIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    (a === 100 && b >= 64 && b <= 127) ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff")
  );
}

function isRestrictedAddress(address: string) {
  if (net.isIPv4(address)) {
    return isPrivateIpv4(address);
  }
  if (net.isIPv6(address)) {
    if (address.toLowerCase().startsWith("::ffff:")) {
      const mapped = address.slice(7);
      return net.isIPv4(mapped) ? isPrivateIpv4(mapped) : true;
    }
    return isPrivateIpv6(address);
  }
  return true;
}

async function assertSafeFetchUrl(url: URL) {
  const hostname = url.hostname.toLowerCase();
  if (isBlockedHostname(hostname)) {
    throw new Error("URL points to a restricted address");
  }

  if (net.isIP(hostname)) {
    if (isRestrictedAddress(hostname)) {
      throw new Error("URL points to a restricted address");
    }
    return;
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: false });
  if (addresses.length === 0 || addresses.some((entry) => isRestrictedAddress(entry.address))) {
    throw new Error("URL points to a restricted address");
  }
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function isValidImageSignature(buffer: Buffer, contentType: string) {
  if (contentType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }

  const signatures = FILE_SIGNATURES[contentType] || [];
  return signatures.some((signature) =>
    signature.every((byte, index) => buffer[index] === byte),
  );
}

async function fetchImageUrl(initialUrl: URL, signal: AbortSignal) {
  let currentUrl = initialUrl;
  for (let redirectCount = 0; redirectCount <= 5; redirectCount++) {
    await assertSafeFetchUrl(currentUrl);
    const response = await fetch(currentUrl, {
      signal,
      headers: { Accept: "image/*,*/*;q=0.8" },
      redirect: "manual",
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error(`Could not fetch image (HTTP ${response.status})`);
      }
      currentUrl = new URL(location, currentUrl);
      if (currentUrl.protocol !== "http:" && currentUrl.protocol !== "https:") {
        throw new Error("URL must use http or https");
      }
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects while fetching image");
}

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
      key: `upload:url:minute:${actorKey}`,
      limit: 15,
      windowSeconds: 60,
    });
    await enforceRateLimit({
      key: `upload:url:hour:${actorKey}`,
      limit: 120,
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

  const parsed = parseUploadUrl(rawUrl);
  if (!parsed.url) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const r2 = getR2ConfigState();
    if (isProduction() && !r2.enabled) {
      return NextResponse.json(
        { error: "Cloudflare R2 must be configured for production uploads." },
        { status: 500 },
      );
    }
    if (r2.hasCoreCredentials && !r2.hasPublicUrl) {
      return NextResponse.json(
        {
          error:
            "R2 is partially configured. Set R2_PUBLIC_URL (custom domain or R2 public development URL) to serve uploaded files.",
        },
        { status: 500 },
      );
    }

    const res = await fetchImageUrl(parsed.url, controller.signal);

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
            "URL does not point to a supported image type (JPEG, PNG, WebP, GIF)",
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
    if (!isValidImageSignature(buffer, contentType)) {
      return NextResponse.json(
        { error: "Image content does not match the remote content type." },
        { status: 400 },
      );
    }

    // Save to R2 (prod) or a local upload directory served through a route (dev)
    if (r2.enabled) {
      const { uploadFile } = await import("@/lib/r2");
      const result = await uploadFile(buffer, contentType, "images");
      return NextResponse.json({ url: result.url, key: result.key });
    }

    const ext = contentType.split("/")[1] || "jpg";
    const filename = `${randomUUID()}.${ext}`;
    await mkdir(getLocalUploadDir(), { recursive: true });
    await writeFile(getLocalUploadPath(filename), buffer);

    return NextResponse.json({
      url: getLocalUploadUrl(filename),
      key: `uploads/${filename}`,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      return NextResponse.json(
        { error: "Timed out fetching the image URL" },
        { status: 400 },
      );
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[Upload URL]", e);
    return NextResponse.json(
      { error: "Failed to fetch and save image" },
      { status: 500 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
