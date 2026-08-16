"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { PlantNoteKind, PlantStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const statuses: PlantStatus[] = ["PERSONAL", "FOR_SALE", "SOLD"];
const noteKinds: PlantNoteKind[] = ["HEALTH", "YIELD", "GENERAL"];

function s(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function createRecord(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const varietyId = s(formData.get("varietyId")) || null;
  const rootstock = s(formData.get("rootstock")) || null;
  const status = (s(formData.get("status")) || "PERSONAL") as PlantStatus;

  if (!varietyId && !rootstock) {
    redirect("/records/new?error=" + encodeURIComponent("Choose a variety or enter a rootstock."));
  }

  const record = await db.plantRecord.create({
    data: {
      userId: session.user.id,
      varietyId,
      rootstock,
      rootstockSource: s(formData.get("rootstockSource")) || null,
      scionSource: s(formData.get("scionSource")) || null,
      sourceListingId: s(formData.get("sourceListingId")) || null,
      graftDate: s(formData.get("graftDate")) ? new Date(s(formData.get("graftDate"))) : null,
      location: s(formData.get("location")) || null,
      status: statuses.includes(status) ? status : "PERSONAL",
      notes: s(formData.get("notes")) || null,
    },
  });

  redirect(`/records/${record.id}`);
}

export async function addNote(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const recordId = s(formData.get("recordId"));
  const note = s(formData.get("note"));
  const kind = (s(formData.get("kind")) || "GENERAL") as PlantNoteKind;
  const amountRaw = s(formData.get("amount"));

  if (!recordId || !note) redirect(`/records/${recordId || ""}`);

  const record = await db.plantRecord.findUnique({ where: { id: recordId } });
  if (!record || record.userId !== session.user.id) redirect("/records");

  await db.plantNote.create({
    data: {
      recordId,
      kind: noteKinds.includes(kind) ? kind : "GENERAL",
      note,
      amount: amountRaw ? Number(amountRaw) || null : null,
    },
  });

  revalidatePath(`/records/${recordId}`);
  redirect(`/records/${recordId}`);
}
