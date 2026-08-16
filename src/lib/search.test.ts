import { describe, expect, it } from "vitest";
import { buildSearchHref, parseSearchQuery, savedSearchHref } from "./search";

describe("buildSearchHref", () => {
  it("builds a query string from base params", () => {
    expect(buildSearchHref({ q: "cox", type: "SCION_WOOD" }, {})).toBe(
      "/listings?q=cox&type=SCION_WOOD",
    );
  });

  it("applies overrides", () => {
    expect(buildSearchHref({ q: "cox", page: "1" }, { page: "2" })).toBe(
      "/listings?q=cox&page=2",
    );
  });

  it("omits empty values", () => {
    expect(buildSearchHref({ q: "", type: "" }, {})).toBe("/listings");
  });

  it("uses a custom path", () => {
    expect(buildSearchHref({ species: "Malus" }, {}, "/varieties")).toBe(
      "/varieties?species=Malus",
    );
  });
});

describe("parseSearchQuery", () => {
  it("parses a JSON object", () => {
    expect(parseSearchQuery('{"q":"cox","type":"SEED"}')).toEqual({
      q: "cox",
      type: "SEED",
    });
  });

  it("returns empty for invalid JSON", () => {
    expect(parseSearchQuery("not json")).toEqual({});
  });

  it("filters non-string values", () => {
    expect(parseSearchQuery('{"q":"cox","nested":{},"arr":[]}')).toEqual({ q: "cox" });
  });
});

describe("savedSearchHref", () => {
  it("converts a stored query into a href", () => {
    expect(savedSearchHref('{"q":"ashmeads"}')).toBe("/listings?q=ashmeads");
  });

  it("handles invalid queries", () => {
    expect(savedSearchHref("garbage")).toBe("/listings");
  });
});
