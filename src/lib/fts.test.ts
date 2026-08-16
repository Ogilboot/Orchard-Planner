import { describe, expect, it } from "vitest";
import { ftsQuery } from "./fts";

describe("ftsQuery", () => {
  it("prefixes each token", () => {
    expect(ftsQuery("Ashmeads Kernel")).toBe('"ashmeads"* "kernel"*');
  });

  it("lowercases input", () => {
    expect(ftsQuery("COX")).toBe('"cox"*');
  });

  it("strips punctuation but keeps apostrophes", () => {
    expect(ftsQuery("Ashmead's Kernel!")).toBe('"ashmead\'s"* "kernel"*');
  });

  it("returns empty string for blank or symbolic input", () => {
    expect(ftsQuery("")).toBe("");
    expect(ftsQuery("   ")).toBe("");
    expect(ftsQuery("!!")).toBe("");
  });

  it("handles multiple spaces", () => {
    expect(ftsQuery("  cox   orange  ")).toBe('"cox"* "orange"*');
  });
});
