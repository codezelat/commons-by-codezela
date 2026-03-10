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
  const value = url?.trim();
  if (!value) {
    return "";
  }

  if (value.startsWith("/api/uploads/")) {
    return value;
  }

  if (value.startsWith("api/uploads/")) {
    return `/${value}`;
  }

  if (value.startsWith("/uploads/")) {
    return `/api${value}`;
  }

  if (value.startsWith("uploads/")) {
    return `/api/${value}`;
  }

  if (value.startsWith("./uploads/")) {
    return `/api/${value.slice(2)}`;
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  if (value.startsWith(`${appUrl}/uploads/`)) {
    return `${appUrl}/api${value.slice(appUrl.length)}`;
  }

  if (value.startsWith(`${appUrl}/api/uploads/`)) {
    return value;
  }

  return value;
}

export function normalizeLocalUploadUrlsInHtml(html: string) {
  return html
    .replaceAll('src="/uploads/', 'src="/api/uploads/')
    .replaceAll("src='/uploads/", "src='/api/uploads/")
    .replaceAll('href="/uploads/', 'href="/api/uploads/')
    .replaceAll("href='/uploads/", "href='/api/uploads/");
}
