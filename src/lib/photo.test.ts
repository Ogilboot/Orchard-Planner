import { describe, expect, it } from "vitest";
import { isAcceptedPhoto, MAX_LISTING_PHOTOS, MAX_PHOTO_BYTES } from "./photo";

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
