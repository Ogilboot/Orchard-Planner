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

// Detect the real image format from the file's magic bytes, rather than
// trusting the client-supplied MIME type.
export function detectImageType(buf: Buffer): string | null {
  if (buf.length < 3) return null;

  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "image/png";
  }

  // GIF: "GIF87a" or "GIF89a"
  if (buf.length >= 6) {
    const head = buf.subarray(0, 6).toString("latin1");
    if (head === "GIF87a" || head === "GIF89a") return "image/gif";
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buf.length >= 12 &&
    buf.subarray(0, 4).toString("latin1") === "RIFF" &&
    buf.subarray(8, 12).toString("latin1") === "WEBP"
  ) {
    return "image/webp";
  }

  // AVIF/HEIF: bytes 4..8 are "ftyp", brand at 8..12
  if (buf.length >= 12 && buf.subarray(4, 8).toString("latin1") === "ftyp") {
    const brand = buf.subarray(8, 12).toString("latin1");
    if (brand === "avif" || brand === "avis") return "image/avif";
  }

  return null;
}

export async function savePhoto(file: File): Promise<string> {
  if (!isAcceptedPhoto(file)) {
    throw new Error("Photos must be JPEG, PNG, WebP, GIF or AVIF and under 5MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(bytes);
  if (!detected) {
    throw new Error("Unrecognised image format.");
  }

  const ext = MIME_EXT[detected];
  const name = `${randomUUID()}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`;
}

export async function deletePhotoFile(url: string): Promise<void> {
  const name = path.basename(url);
  await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
}
