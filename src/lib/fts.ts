import { db } from "@/lib/db";

const CREATE_SQL = `
  CREATE VIRTUAL TABLE IF NOT EXISTS variety_fts USING fts5(
    id UNINDEXED,
    commonName,
    species,
    synonyms,
    notes,
    tokenize = 'unicode61'
  );
`;

const CREATE_USER_SQL = `
  CREATE VIRTUAL TABLE IF NOT EXISTS user_fts USING fts5(
    id UNINDEXED,
    name,
    location,
    bio,
    tokenize = 'unicode61'
  );
`;

let ensured = false;
let ensuredUsers = false;

export async function ensureVarietyFts(): Promise<void> {
  if (ensured) return;
  try {
    await db.$executeRawUnsafe(CREATE_SQL);
    ensured = true;
  } catch {
    // ignore — search will fall back to "contains"
  }
}

export async function ensureUserFts(): Promise<void> {
  if (ensuredUsers) return;
  try {
    await db.$executeRawUnsafe(CREATE_USER_SQL);
    ensuredUsers = true;
  } catch {
    // ignore
  }
}

export interface IndexableVariety {
  id: string;
  commonName: string;
  species?: string | null;
  synonyms?: string[];
  harvestWindow?: string | null;
  flavorNotes?: string | null;
  originNotes?: string | null;
  diseaseResistanceNotes?: string | null;
}

export async function indexVariety(v: IndexableVariety): Promise<void> {
  await ensureVarietyFts();
  const synonyms = (v.synonyms ?? []).join(" ");
  const notes = [
    v.harvestWindow,
    v.flavorNotes,
    v.originNotes,
    v.diseaseResistanceNotes,
  ]
    .filter(Boolean)
    .join(" ");
  try {
    await db.$executeRawUnsafe("DELETE FROM variety_fts WHERE id = ?", v.id);
    await db.$executeRawUnsafe(
      "INSERT INTO variety_fts(id, commonName, species, synonyms, notes) VALUES (?, ?, ?, ?, ?)",
      v.id,
      v.commonName,
      v.species ?? "",
      synonyms,
      notes,
    );
  } catch {
    // ignore
  }
}

export async function deleteVarietyFromIndex(id: string): Promise<void> {
  await ensureVarietyFts();
  try {
    await db.$executeRawUnsafe("DELETE FROM variety_fts WHERE id = ?", id);
  } catch {
    // ignore
  }
}

export async function searchVarieties(
  query: string,
  limit = 100,
): Promise<{ id: string; rank: number }[]> {
  await ensureVarietyFts();
  const fts = ftsQuery(query);
  if (!fts) return [];
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  try {
    const rows = await db.$queryRawUnsafe<{ id: string; rank_score: number }[]>(
      `SELECT id, rank AS rank_score FROM variety_fts WHERE variety_fts MATCH ? ORDER BY rank LIMIT ${safeLimit}`,
      fts,
    );
    return rows.map((r) => ({ id: r.id, rank: Number(r.rank_score) }));
  } catch {
    return [];
  }
}

export async function rebuildVarietyIndex(): Promise<number> {
  await ensureVarietyFts();
  await db.$executeRawUnsafe("DELETE FROM variety_fts");
  const varieties = await db.variety.findMany({ include: { synonyms: true } });
  for (const v of varieties) {
    await indexVariety({
      ...v,
      synonyms: v.synonyms.map((s) => s.name),
    });
  }
  return varieties.length;
}

export function ftsQuery(input: string): string {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z0-9']+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return "";
  return tokens.map((t) => `"${t}"*`).join(" ");
}

export interface IndexableUser {
  id: string;
  name?: string | null;
  location?: string | null;
  bio?: string | null;
}

export async function indexUser(u: IndexableUser): Promise<void> {
  await ensureUserFts();
  try {
    await db.$executeRawUnsafe("DELETE FROM user_fts WHERE id = ?", u.id);
    await db.$executeRawUnsafe(
      "INSERT INTO user_fts(id, name, location, bio) VALUES (?, ?, ?, ?)",
      u.id,
      u.name ?? "",
      u.location ?? "",
      u.bio ?? "",
    );
  } catch {
    // ignore
  }
}

export async function deleteUserFromIndex(id: string): Promise<void> {
  await ensureUserFts();
  try {
    await db.$executeRawUnsafe("DELETE FROM user_fts WHERE id = ?", id);
  } catch {
    // ignore
  }
}

export async function searchUsers(
  query: string,
  limit = 100,
): Promise<{ id: string; rank: number }[]> {
  await ensureUserFts();
  const fts = ftsQuery(query);
  if (!fts) return [];
  const safeLimit = Math.max(1, Math.min(500, Math.floor(limit)));
  try {
    const rows = await db.$queryRawUnsafe<{ id: string; rank_score: number }[]>(
      `SELECT id, rank AS rank_score FROM user_fts WHERE user_fts MATCH ? ORDER BY rank LIMIT ${safeLimit}`,
      fts,
    );
    return rows.map((r) => ({ id: r.id, rank: Number(r.rank_score) }));
  } catch {
    return [];
  }
}

export async function rebuildUserIndex(): Promise<number> {
  await ensureUserFts();
  await db.$executeRawUnsafe("DELETE FROM user_fts");
  const users = await db.user.findMany({
    select: { id: true, name: true, location: true, bio: true },
  });
  for (const u of users) {
    await indexUser(u);
  }
  return users.length;
}
