import { describe, expect, it } from "vitest";
import { detectImageType, isAcceptedPhoto, MAX_LISTING_PHOTOS, MAX_PHOTO_BYTES } from "./photo";

function file(type: string, size: number): File {
  const bytes = new Uint8Array(size);
  return new File([bytes], "photo.bin", { type });
}

describe("isAcceptedPhoto", () => {
  it("accepts supported image types within size limits", () => {
    expect(isAcceptedPhoto(file("image/jpeg", 1000))).toBe(true);
    expect(isAcceptedPhoto(file("image/png", MAX_PHOTO_BYTES))).toBe(true);
    expect(isAcceptedPhoto(file("image/webp", 1))).toBe(true);
    expect(isAcceptedPhoto(file("image/gif", 10))).toBe(true);
    expect(isAcceptedPhoto(file("image/avif", 10))).toBe(true);
  });

  it("rejects unsupported types", () => {
    expect(isAcceptedPhoto(file("text/plain", 100))).toBe(false);
    expect(isAcceptedPhoto(file("application/pdf", 100))).toBe(false);
    expect(isAcceptedPhoto(file("", 100))).toBe(false);
  });

  it("rejects empty and oversized files", () => {
    expect(isAcceptedPhoto(file("image/jpeg", 0))).toBe(false);
    expect(isAcceptedPhoto(file("image/jpeg", MAX_PHOTO_BYTES + 1))).toBe(false);
  });

  it("exposes the max photo constants", () => {
    expect(MAX_LISTING_PHOTOS).toBe(4);
    expect(MAX_PHOTO_BYTES).toBe(5 * 1024 * 1024);
  });
});

describe("detectImageType", () => {
  it("detects JPEG by magic bytes", () => {
    expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
  });

  it("detects PNG by magic bytes", () => {
    expect(
      detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    ).toBe("image/png");
  });

  it("detects GIF by magic bytes", () => {
    expect(detectImageType(Buffer.from("GIF89a", "latin1"))).toBe("image/gif");
    expect(detectImageType(Buffer.from("GIF87a", "latin1"))).toBe("image/gif");
  });

  it("detects WebP by RIFF/WEBP signature", () => {
    const buf = Buffer.concat([
      Buffer.from("RIFF", "latin1"),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from("WEBP", "latin1"),
    ]);
    expect(detectImageType(buf)).toBe("image/webp");
  });

  it("detects AVIF by ftyp brand", () => {
    const buf = Buffer.concat([
      Buffer.from([0, 0, 0, 0]),
      Buffer.from("ftyp", "latin1"),
      Buffer.from("avif", "latin1"),
      Buffer.from([0, 0, 0, 0]),
    ]);
    expect(detectImageType(buf)).toBe("image/avif");
  });

  it("rejects non-image content", () => {
    expect(detectImageType(Buffer.from("plain text", "latin1"))).toBeNull();
    expect(detectImageType(Buffer.from([0, 1, 2, 3]))).toBeNull();
    expect(detectImageType(Buffer.from([]))).toBeNull();
  });
});
