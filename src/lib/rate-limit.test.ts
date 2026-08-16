import { describe, expect, it } from "vitest";
import { checkRateLimit, ipFromHeaders } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the limit", () => {
    const key = `test-${Math.random()}`;
    expect(checkRateLimit(key, 2, 1000).ok).toBe(true);
    expect(checkRateLimit(key, 2, 1000).ok).toBe(true);
  });

  it("blocks requests beyond the limit within the window", () => {
    const key = `test-${Math.random()}`;
    checkRateLimit(key, 1, 60_000);
    const second = checkRateLimit(key, 1, 60_000);
    expect(second.ok).toBe(false);
    expect(second.retryAfterMs).toBeGreaterThan(0);
  });
});

describe("ipFromHeaders", () => {
  function headers(entries: Record<string, string>) {
    return { get: (name: string) => entries[name.toLowerCase()] ?? null };
  }

  it("reads x-forwarded-for first", () => {
    expect(
      ipFromHeaders(headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8", "x-real-ip": "9.9.9.9" })),
    ).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    expect(ipFromHeaders(headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
  });

  it("returns unknown when no header present", () => {
    expect(ipFromHeaders(headers({}))).toBe("unknown");
  });
});
