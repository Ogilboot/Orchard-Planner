import { describe, expect, it } from "vitest";
import {
  formatListingPrice,
  formatListingPriceShort,
  formatMaterialType,
  formatPounds,
} from "./price";

describe("formatPounds", () => {
  it("formats pence to pounds", () => {
    expect(formatPounds(250)).toBe("£2.50");
    expect(formatPounds(0)).toBe("£0.00");
    expect(formatPounds(300)).toBe("£3.00");
  });

  it("returns em dash for null/undefined", () => {
    expect(formatPounds(null)).toBe("—");
    expect(formatPounds(undefined)).toBe("—");
  });
});

describe("formatListingPrice", () => {
  it("shows trade-only", () => {
    expect(formatListingPrice(true, null)).toBe("Trade only");
    expect(formatListingPrice(true, 500)).toBe("Trade only");
  });

  it("shows a price when not trade-only", () => {
    expect(formatListingPrice(false, 250)).toBe("£2.50");
  });

  it("shows em dash when no price and not trade-only", () => {
    expect(formatListingPrice(false, null)).toBe("—");
  });
});

describe("formatListingPriceShort", () => {
  it("uses short 'Trade' label", () => {
    expect(formatListingPriceShort(true, null)).toBe("Trade");
    expect(formatListingPriceShort(false, 600)).toBe("£6.00");
  });
});

describe("formatMaterialType", () => {
  it("lowercases and spaces enum values", () => {
    expect(formatMaterialType("SCION_WOOD")).toBe("scion wood");
    expect(formatMaterialType("HARDWOOD_CUTTING")).toBe("hardwood cutting");
    expect(formatMaterialType("POTTED_TREE")).toBe("potted tree");
  });
});
