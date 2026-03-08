import { join } from "path";

export function getLocalUploadDir() {
  return join(process.cwd(), ".uploads");
}

export function getLegacyPublicUploadDir() {
  return join(process.cwd(), "public", "uploads");
}

export function getLocalUploadPath(filename: string) {
  return join(getLocalUploadDir(), filename);
}

export function getLocalUploadUrl(filename: string) {
  return `/api/uploads/${filename}`;
}

export function normalizeLocalUploadUrl(url?: string | null) {
  if (!url) {
    return url ?? "";
  }

  if (url.startsWith("/api/uploads/")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `/api${url}`;
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  if (url.startsWith(`${appUrl}/uploads/`)) {
    return `${appUrl}/api${url.slice(appUrl.length)}`;
  }

  return url;
}

export function normalizeLocalUploadUrlsInHtml(html: string) {
  return html
    .replaceAll('src="/uploads/', 'src="/api/uploads/')
    .replaceAll("src='/uploads/", "src='/api/uploads/")
    .replaceAll('href="/uploads/', 'href="/api/uploads/')
    .replaceAll("href='/uploads/", "href='/api/uploads/");
}
