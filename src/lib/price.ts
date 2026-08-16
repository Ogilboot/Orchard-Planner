export function formatPounds(pence: number | null | undefined): string {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatListingPrice(tradeOnly: boolean, pricePence: number | null): string {
  if (tradeOnly) return "Trade only";
  if (pricePence != null) return formatPounds(pricePence);
  return "—";
}

export function formatListingPriceShort(tradeOnly: boolean, pricePence: number | null): string {
  if (tradeOnly) return "Trade";
  if (pricePence != null) return formatPounds(pricePence);
  return "—";
}

export function formatMaterialType(type: string): string {
  return type.replaceAll("_", " ").toLowerCase();
}
