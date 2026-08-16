export function compatiblePollinationGroups(group: string): string[] {
  const n = Number(group);
  if (!Number.isFinite(n)) return [group];
  const set = new Set<string>();
  for (const x of [n - 1, n, n + 1]) {
    if (x >= 0) set.add(String(x));
  }
  return [...set];
}
