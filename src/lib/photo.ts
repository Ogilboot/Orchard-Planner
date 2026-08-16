import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_LISTING_PHOTOS = 4;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export function isAcceptedPhoto(file: File): boolean {
  return Boolean(MIME_EXT[file.type]) && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}

export async function savePhoto(file: File): Promise<string> {
  if (!isAcceptedPhoto(file)) {
    throw new Error("Photos must be JPEG, PNG, WebP, GIF or AVIF and under 5MB.");
  }
  const ext = MIME_EXT[file.type];
  const name = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}

export async function deletePhotoFile(url: string): Promise<void> {
  const name = path.basename(url);
  await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}