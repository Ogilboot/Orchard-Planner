"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";

const rootstockSchema = z.object({
  name: z.string().trim().min(1).max(100),
  species: z.string().trim().max(100).optional(),
  vigour: z.string().trim().max(100).optional(),
  dwarfingClass: z.string().trim().max(100).optional(),
  chillHours: z.coerce.number().int().min(0).max(3000).optional(),
  soilNotes: z.string().trim().max(2000).optional(),
  diseaseResistanceNotes: z.string().trim().max(2000).optional(),
});

function parse(formData: FormData) {
  return rootstockSchema.safeParse({
    name: formData.get("name"),
    species: formData.get("species") || undefined,
    vigour: formData.get("vigour") || undefined,
    dwarfingClass: formData.get("dwarfingClass") || undefined,
    chillHours: formData.get("chillHours") || undefined,
    soilNotes: formData.get("soilNotes") || undefined,
    diseaseResistanceNotes: formData.get("diseaseResistanceNotes") || undefined,
  });
}

export async function createRootstock(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = parse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin/rootstocks/new?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  await db.rootstock.create({
    data: {
      name: data.name,
      species: data.species || null,
      vigour: data.vigour || null,
      dwarfingClass: data.dwarfingClass || null,
      chillHours: data.chillHours ?? null,
      soilNotes: data.soilNotes || null,
      diseaseResistanceNotes: data.diseaseResistanceNotes || null,
    },
  });

  revalidatePath("/admin/rootstocks");
  revalidatePath("/rootstocks");
  redirect("/admin/rootstocks");
}

export async function updateRootstock(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/rootstocks");

  const parsed = parse(formData);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/admin/rootstocks/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  await db.rootstock.update({
    where: { id },
    data: {
      name: data.name,
      species: data.species || null,
      vigour: data.vigour || null,
      dwarfingClass: data.dwarfingClass || null,
      chillHours: data.chillHours ?? null,
      soilNotes: data.soilNotes || null,
      diseaseResistanceNotes: data.diseaseResistanceNotes || null,
    },
  });

  revalidatePath("/admin/rootstocks");
  revalidatePath("/rootstocks");
  revalidatePath(`/rootstocks/${id}`);
  redirect("/admin/rootstocks");
}

export async function deleteRootstock(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin/rootstocks");

  await db.rootstock.delete({ where: { id } });

  revalidatePath("/admin/rootstocks");
  revalidatePath("/rootstocks");
  redirect("/admin/rootstocks");
}
