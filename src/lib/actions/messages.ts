"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/mail";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

const MESSAGE_LIMIT = 10;
const MESSAGE_WINDOW = 60 * 1000;

async function messageRateLimited(): Promise<boolean> {
  const ip = ipFromHeaders(await headers());
  return !checkRateLimit(`message:${ip}`, MESSAGE_LIMIT, MESSAGE_WINDOW).ok;
}

export async function sendMessage(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const body = String(formData.get("body") || "").trim().slice(0, 2000);
  if (!body || !listingId) return;

  if (await messageRateLimited()) return;
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
  const body = String(formData.get("body") || "").trim().slice(0, 2000);
  const listingId = String(formData.get("listingId") || "") || null;
  if (!recipientId || !body || recipientId === session.user.id) return;

  if (await messageRateLimited()) return;

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
