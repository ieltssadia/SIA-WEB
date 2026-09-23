import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

let r2Instance: S3Client | null = null;

export function getR2Client(): S3Client | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) return null;
  if (!r2Instance) {
    r2Instance = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }
  return r2Instance;
}

export function isR2Configured(): boolean {
  return getR2Client() !== null;
}

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "sia-storage";
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

const MIME_MAP: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  mp4: "video/mp4",
  html: "text/html; charset=utf-8",
  htm: "text/html; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  json: "application/json",
  zip: "application/zip",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function getMimeType(ext: string): string {
  return MIME_MAP[ext.toLowerCase()] || "application/octet-stream";
}

/**
 * Upload a Buffer or Uint8Array to Cloudflare R2
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType?: string
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  if (!client) throw new Error("R2 is not configured");

  const ext = key.split(".").pop() || "";
  const mime = contentType || getMimeType(ext);

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: mime,
    })
  );

  const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : `/api/media/${key}`;
  return { key, url: publicUrl };
}

/**
 * Delete an object from Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<boolean> {
  const client = getR2Client();
  if (!client) return false;

  try {
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("deleteFromR2 error for key:", key, error);
    return false;
  }
}

/**
 * Get an object from Cloudflare R2
 */
export async function getFromR2(key: string) {
  const client = getR2Client();
  if (!client) throw new Error("R2 is not configured");

  return await client.send(
    new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  );
}
