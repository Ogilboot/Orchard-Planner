import { describe, expect, it } from "vitest";
import { bucketByDay, sparklineGeometry } from "./analytics";

describe("bucketByDay", () => {
  const now = new Date(2026, 7, 16, 12, 0, 0); // 16 Aug 2026

  it("buckets dates into the last N days", () => {
    const buckets = bucketByDay(
      [new Date(2026, 7, 16), new Date(2026, 7, 16), new Date(2026, 7, 14)],
      3,
      now,
    );
    expect(buckets).toEqual([1, 0, 2]);
  });

  it("ignores dates outside the window", () => {
    const buckets = bucketByDay([new Date(2026, 1, 1)], 3, now);
    expect(buckets).toEqual([0, 0, 0]);
  });

  it("handles zero days", () => {
    expect(bucketByDay([], 0, now)).toEqual([]);
  });

  it("handles empty input", () => {
    expect(bucketByDay([], 7, now)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });
});

describe("sparklineGeometry", () => {
  it("returns empty geometry for no values", () => {
    expect(sparklineGeometry([], 100, 50)).toEqual({ line: "", area: "", max: 0 });
  });

  it("scales values to the given dimensions", () => {
    const { line, max } = sparklineGeometry([0, 5, 10], 100, 50, 0);
    expect(max).toBe(10);
    expect(line).toBe("0.0,50.0 50.0,25.0 100.0,0.0");
  });

  it("treats the max of all-zero input as 1", () => {
    const { line } = sparklineGeometry([0, 0], 100, 50, 0);
    expect(line).toBe("0.0,50.0 100.0,50.0");
  });

  it("includes an area path closing to the baseline", () => {
    const { area } = sparklineGeometry([1, 1], 10, 10, 0);
    expect(area).toContain("Z");
  });
});
