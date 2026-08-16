import { describe, expect, it } from "vitest";
import { detectOverlaps } from "./spacing";

describe("detectOverlaps", () => {
  it("detects trees that are too close", () => {
    const overlaps = detectOverlaps([
      { id: "a", x: 0, y: 0, width: 4, height: 4 },
      { id: "b", x: 2, y: 0, width: 4, height: 4 },
    ]);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].distance).toBeCloseTo(2);
  });

  it("does not flag trees at a safe distance", () => {
    const overlaps = detectOverlaps([
      { id: "a", x: 0, y: 0, width: 4, height: 4 },
      { id: "b", x: 10, y: 0, width: 4, height: 4 },
    ]);
    expect(overlaps).toHaveLength(0);
  });

  it("ignores coincident points", () => {
    const overlaps = detectOverlaps([
      { id: "a", x: 5, y: 5, width: 4, height: 4 },
      { id: "b", x: 5, y: 5, width: 4, height: 4 },
    ]);
    expect(overlaps).toHaveLength(0);
  });

  it("handles an empty list", () => {
    expect(detectOverlaps([])).toEqual([]);
  });
});
