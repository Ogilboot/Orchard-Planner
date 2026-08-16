"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function addWantEntry(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const varietyId = String(formData.get("varietyId") || "");
  const notes = String(formData.get("notes") || "").trim();
  if (!varietyId) return;

  await db.wantListEntry.upsert({
    where: { userId_varietyId: { userId: session.user.id, varietyId } },
    update: { active: true, notes: notes || null },
    create: { userId: session.user.id, varietyId, notes: notes || null },
  });

  revalidatePath("/wantlist");
  revalidatePath(`/varieties/${varietyId}`);
}

export async function removeWantEntry(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) return;

  await db.wantListEntry.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath("/wantlist");
}
