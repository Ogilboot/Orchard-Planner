"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");
  return session.user.id;
}

export async function setVerifiedStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const verified = formData.get("verified") === "true";
  if (!userId) redirect("/admin");

  await db.user.update({
    where: { id: userId },
    data: { isVerifiedNursery: verified },
  });

  revalidatePath("/admin");
  revalidatePath(`/users/${userId}`);
}

export async function setUserRole(formData: FormData): Promise<void> {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "") as "USER" | "ADMIN";
  if (!userId || !["USER", "ADMIN"].includes(role)) redirect("/admin");

  await db.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/admin");
}
