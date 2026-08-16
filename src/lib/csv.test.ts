import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("passes through simple values", () => {
    expect(csvCell("apple")).toBe("apple");
    expect(csvCell(123)).toBe("123");
    expect(csvCell(0)).toBe("0");
  });

  it("returns empty for null/undefined", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });

  it("quotes values containing commas, quotes or newlines", () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"');
  });
});

describe("toCsv", () => {
  it("joins rows with newlines", () => {
    const csv = toCsv([
      ["Name", "Qty"],
      ["Cox", 5],
    ]);
    expect(csv).toBe("Name,Qty\nCox,5");
  });

  it("escapes cells that need it", () => {
    const csv = toCsv([["Name, Inc.", "a\nb"]]);
    expect(csv).toBe('"Name, Inc.","a\nb"');
  });
});
