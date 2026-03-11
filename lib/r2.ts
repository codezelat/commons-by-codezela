import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME || "commons-uploads";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

function getExtensionFromContentType(contentType: string): string {
  const normalized = contentType.split(";")[0].trim().toLowerCase();
  if (normalized === "image/svg+xml") {
    return "svg";
  }
  const fromSlash = normalized.split("/")[1];
  return fromSlash || "bin";
}

export async function uploadFile(
  file: Buffer,
  contentType: string,
  folder: string = "uploads",
): Promise<{ key: string; url: string }> {
  const ext = getExtensionFromContentType(contentType);
  const key = `${folder}/${randomUUID()}.${ext}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  if (!PUBLIC_URL) {
    throw new Error(
      "R2_PUBLIC_URL is required to serve uploaded files publicly. Configure a custom domain or the R2 public development URL.",
    );
  }

  return {
    key,
    url: `${PUBLIC_URL}/${key}`,
  };
}

export async function deleteFile(key: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  );
}
