"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function followUser(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const followingId = String(formData.get("followingId") || "");
  if (!followingId || followingId === session.user.id) return;

  await db.follow.upsert({
    where: { followerId_followingId: { followerId: session.user.id, followingId } },
    update: {},
    create: { followerId: session.user.id, followingId },
  });

  revalidatePath(`/users/${followingId}`);
  revalidatePath("/following");
}

export async function unfollowUser(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const followingId = String(formData.get("followingId") || "");
  if (!followingId) return;

  await db.follow.deleteMany({
    where: { followerId: session.user.id, followingId },
  });

  revalidatePath(`/users/${followingId}`);
  revalidatePath("/following");
}
