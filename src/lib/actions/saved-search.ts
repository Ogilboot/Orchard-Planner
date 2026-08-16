"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function saveSearch(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = String(formData.get("name") || "").trim();
  const query = String(formData.get("query") || "").trim();
  if (!name || !query) redirect("/listings");

  await db.savedSearch.create({
    data: { userId: session.user.id, name, query },
  });

  revalidatePath("/saved-searches");
  redirect("/saved-searches");
}

export async function deleteSavedSearch(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) redirect("/saved-searches");

  await db.savedSearch.deleteMany({ where: { id, userId: session.user.id } });

  revalidatePath("/saved-searches");
  redirect("/saved-searches");
}
