import { describe, expect, it } from "vitest";
import { compatiblePollinationGroups } from "./pollination";

describe("compatiblePollinationGroups", () => {
  it("returns the group and its neighbours", () => {
    expect(compatiblePollinationGroups("3")).toEqual(["2", "3", "4"]);
    expect(compatiblePollinationGroups("5")).toEqual(["4", "5", "6"]);
  });

  it("drops negative groups at the low end", () => {
    expect(compatiblePollinationGroups("0")).toEqual(["0", "1"]);
    expect(compatiblePollinationGroups("1")).toEqual(["0", "1", "2"]);
  });

  it("handles non-numeric groups gracefully", () => {
    expect(compatiblePollinationGroups("N/A")).toEqual(["N/A"]);
  });
});
