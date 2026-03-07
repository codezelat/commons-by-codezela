const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

export interface UploadResult {
  url: string;
  key: string;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

/**
 * Validate a file before uploading.
 * Throws UploadError with a user-friendly message.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError(
      "Invalid file type. Only JPEG, PNG, WebP, GIF, and SVG are allowed.",
    );
  }
  if (file.size > MAX_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    throw new UploadError(
      `File is too large (${sizeMB} MB). Maximum size is 5 MB.`,
    );
  }
}

/**
 * Upload an image file to the server (→ Cloudflare R2).
 * Returns the public URL of the uploaded image.
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new UploadError(body.error || `Upload failed (${res.status})`);
  }

  return res.json();
}

/**
 * Format bytes into a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
