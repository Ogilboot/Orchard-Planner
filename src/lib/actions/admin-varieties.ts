"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const varietySchema = z.object({
  commonName: z.string().trim().min(1).max(200),
  species: z.string().trim().max(200).optional(),
  chillHours: z.coerce.number().int().min(0).max(3000).optional(),
  hardinessZone: z.string().trim().max(20).optional(),
  pollinationGroup: z.string().trim().max(20).optional(),
  harvestWindow: z.string().trim().max(100).optional(),
  flavorNotes: z.string().trim().max(3000).optional(),
  diseaseResistanceNotes: z.string().trim().max(3000).optional(),
  originNotes: z.string().trim().max(3000).optional(),
  selfFertile: z.string().optional(),
  triploid: z.string().optional(),
  diseaseRating: z.coerce.number().int().min(1).max(5).optional(),
  heritage: z.boolean().optional(),
  synonyms: z.string().optional(),
});

function parseBool(value: string | undefined): boolean | null {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function parseSynonyms(raw: string | undefined): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  for (const part of raw.split(/[\n,;]/)) {
    const name = part.trim();
    if (name) seen.add(name);
  }
  return [...seen];
}

function parseVariety(formData: FormData) {
  const selfFertile = String(formData.get("selfFertile") || "");
  const triploid = String(formData.get("triploid") || "");
  return varietySchema.safeParse({
    commonName: formData.get("commonName"),
    species: formData.get("species") || undefined,
    chillHours: formData.get("chillHours") || undefined,
    hardinessZone: formData.get("hardinessZone") || undefined,
    pollinationGroup: formData.get("pollinationGroup") || undefined,
    harvestWindow: formData.get("harvestWindow") || undefined,
    flavorNotes: formData.get("flavorNotes") || undefined,
    diseaseResistanceNotes: formData.get("diseaseResistanceNotes") || undefined,
    originNotes: formData.get("originNotes") || undefined,
    selfFertile,
    triploid,
    diseaseRating: formData.get("diseaseRating") || undefined,
    heritage: formData.get("heritage") === "on",
    synonyms: formData.get("synonyms") || undefined,
  });
}

function toData(parsed: z.infer<typeof varietySchema>) {
  const synonyms = parseSynonyms(parsed.synonyms);
  return {
    commonName: parsed.commonName,
    species: parsed.species || null,
    chillHours: parsed.chillHours ?? null,
    hardinessZone: parsed.hardinessZone || null,
    pollinationGroup: parsed.pollinationGroup || null,
    harvestWindow: parsed.harvestWindow || null,
    flavorNotes: parsed.flavorNotes || null,
    diseaseResistanceNotes: parsed.diseaseResistanceNotes || null,
    originNotes: parsed.originNotes || null,
    selfFertile: parseBool(parsed.selfFertile),
    triploid: parseBool(parsed.triploid),
    diseaseRating: parsed.diseaseRating ?? null,
    heritage: parsed.heritage ?? false,
    synonyms,
  };
}

export async function createVariety(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = parseVariety(formData);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin/varieties/new?error=${encodeURIComponent(message)}`);
  }

  const data = toData(parsed.data);
  const { synonyms, ...fields } = data;

  await db.variety.create({
    data: { ...fields, synonyms: { create: synonyms.map((name) => ({ name })) } },
  });

  revalidatePath("/admin/varieties");
  revalidatePath("/varieties");
  redirect("/admin/varieties");
}

export async function updateVariety(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/varieties");

  const parsed = parseVariety(formData);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin/varieties/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  const data = toData(parsed.data);
  const { synonyms, ...fields } = data;

  await db.variety.update({
    where: { id },
    data: {
      ...fields,
      synonyms: { deleteMany: {}, create: synonyms.map((name) => ({ name })) },
    },
  });

  revalidatePath("/admin/varieties");
  revalidatePath("/varieties");
  revalidatePath(`/varieties/${id}`);
  redirect("/admin/varieties");
}

export async function deleteVariety(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/varieties");

  const listingCount = await db.listing.count({ where: { varietyId: id } });
  if (listingCount > 0) {
    redirect(
      `/admin/varieties?error=${encodeURIComponent(
        "Cannot delete a variety that has listings.",
      )}`,
    );
  }

  await db.variety.delete({ where: { id } });

  revalidatePath("/admin/varieties");
  revalidatePath("/varieties");
  redirect("/admin/varieties");
}

const IMPORT_HEADER = [
  "commonName",
  "species",
  "chillHours",
  "hardinessZone",
  "pollinationGroup",
  "harvestWindow",
  "flavorNotes",
  "diseaseResistanceNotes",
  "originNotes",
  "selfFertile",
  "triploid",
  "diseaseRating",
  "heritage",
  "synonyms",
];

export async function importVarieties(formData: FormData): Promise<void> {
  await requireAdmin();

  const text = String(formData.get("data") || "");
  if (!text.trim()) {
    redirect("/admin/import?error=" + encodeURIComponent("Paste some data first."));
  }

  const lines = text.replace(/\r\n/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = lines.map((line) => line.split("\t"));

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    if (row.length < 1 || !row[0]) {
      skipped++;
      continue;
    }
    if (row[0].toLowerCase() === "commonname") {
      continue;
    }
    const record: Record<string, string> = {};
    IMPORT_HEADER.forEach((key, i) => {
      record[key] = (row[i] ?? "").trim();
    });

    const commonName = record.commonName;
    if (!commonName) {
      skipped++;
      continue;
    }

    const parsed = varietySchema.safeParse({
      commonName,
      species: record.species || undefined,
      chillHours: record.chillHours || undefined,
      hardinessZone: record.hardinessZone || undefined,
      pollinationGroup: record.pollinationGroup || undefined,
      harvestWindow: record.harvestWindow || undefined,
      flavorNotes: record.flavorNotes || undefined,
      diseaseResistanceNotes: record.diseaseResistanceNotes || undefined,
      originNotes: record.originNotes || undefined,
      selfFertile: record.selfFertile || undefined,
      triploid: record.triploid || undefined,
      diseaseRating: record.diseaseRating || undefined,
      heritage: record.heritage === "true" || record.heritage === "yes",
      synonyms: record.synonyms || undefined,
    });

    if (!parsed.success) {
      skipped++;
      continue;
    }

    const data = toData(parsed.data);
    const { synonyms, ...fields } = data;

    const existing = await db.variety.findFirst({
      where: { commonName: data.commonName },
      select: { id: true },
    });

    if (existing) {
      await db.variety.update({
        where: { id: existing.id },
        data: {
          ...fields,
          synonyms: { deleteMany: {}, create: synonyms.map((name) => ({ name })) },
        },
      });
      updated++;
    } else {
      await db.variety.create({
        data: { ...fields, synonyms: { create: synonyms.map((name) => ({ name })) } },
      });
      created++;
    }
  }

  revalidatePath("/varieties");
  redirect(
    `/admin/import?ok=${encodeURIComponent(
      `Imported ${created} new, ${updated} updated, ${skipped} skipped.`,
    )}`,
  );
}
