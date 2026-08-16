"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export async function sendMessage(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body || !listingId) return;

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: { user: { select: { email: true, name: true } }, variety: true },
  });
  if (!listing || listing.userId === session.user.id) return;

  await db.message.create({
    data: {
      senderId: session.user.id,
      recipientId: listing.userId,
      listingId: listing.id,
      body,
    },
  });

  await db.notification.create({
    data: {
      userId: listing.userId,
      type: "MESSAGE",
      message: `You have a new message about ${listing.variety.commonName}.`,
      listingId: listing.id,
    },
  });

  await sendEmail({
    to: listing.user.email,
    subject: `New message about ${listing.variety.commonName}`,
    text: body,
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

  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { email: true },
  });

  await db.notification.create({
    data: {
      userId: recipientId,
      type: "MESSAGE",
      message: "You have a new message.",
      listingId,
    },
  });

  if (recipient) {
    await sendEmail({
      to: recipient.email,
      subject: "You have a new message on Orchard Planner",
      text: body,
    });
  }

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
