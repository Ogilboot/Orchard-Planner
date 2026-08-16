"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function sendMessage(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body || !listingId) return;

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId === session.user.id) return;

  await db.message.create({
    data: {
      senderId: session.user.id,
      recipientId: listing.userId,
      listingId: listing.id,
      body,
    },
  });

  revalidatePath("/messages");
}

export async function sendReply(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const recipientId = String(formData.get("recipientId") || "");
  const body = String(formData.get("body") || "").trim();
  const listingId = String(formData.get("listingId") || "") || null;
  if (!recipientId || !body || recipientId === session.user.id) return;

  await db.message.create({
    data: {
      senderId: session.user.id,
      recipientId,
      listingId,
      body,
    },
  });

  revalidatePath("/messages");
}

export async function markAllMessagesRead(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  await db.message.updateMany({
    where: { recipientId: session.user.id, read: false },
    data: { read: true },
  });

  revalidatePath("/messages");
}
