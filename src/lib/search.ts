export function buildSearchHref(
  base: Record<string, string>,
  overrides: Record<string, string | undefined>,
  path = "/listings",
): string {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function parseSearchQuery(query: string): Record<string, string> {
  try {
    const parsed = JSON.parse(query);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).filter(([, v]) => typeof v === "string" || typeof v === "number"),
      ) as Record<string, string>;
    }
  } catch {
    // fall through
  }
  return {};
}

export function savedSearchHref(query: string, path = "/listings"): string {
  const parsed = parseSearchQuery(query);
  return buildSearchHref(parsed, {}, path);
}
