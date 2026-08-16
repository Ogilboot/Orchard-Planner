"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import type { TransactionStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

const validStatuses: TransactionStatus[] = [
  "PROPOSED",
  "ACCEPTED",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
];

const transitions: Partial<
  Record<TransactionStatus, Partial<Record<"BUYER" | "SELLER", TransactionStatus[]>>>
> = {
  PROPOSED: { BUYER: ["CANCELLED"], SELLER: ["ACCEPTED", "CANCELLED"] },
  ACCEPTED: { BUYER: ["CANCELLED"], SELLER: ["SHIPPED", "COMPLETED", "CANCELLED"] },
  SHIPPED: { BUYER: ["COMPLETED", "CANCELLED"], SELLER: ["CANCELLED"] },
};

function s(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function requestTransaction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const ip = ipFromHeaders(await headers());
  if (!checkRateLimit(`transaction:${ip}`, 20, 60 * 60 * 1000).ok) {
    redirect("/listings");
  }

  const listingId = s(formData.get("listingId"));
  if (!listingId) redirect("/listings");

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") redirect("/listings");
  if (listing.userId === session.user.id) redirect("/listings");

  const existing = await db.transaction.findFirst({
    where: {
      listingId,
      buyerId: session.user.id,
      status: { in: ["PROPOSED", "ACCEPTED", "PAID", "SHIPPED"] },
    },
  });
  if (existing) redirect("/transactions");

  await db.transaction.create({
    data: {
      listingId,
      buyerId: session.user.id,
      sellerId: listing.userId,
      status: "PROPOSED",
      amountPence: listing.pricePence,
      postagePence: listing.postagePence,
    },
  });

  redirect("/transactions");
}

export async function setTransactionStatus(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = s(formData.get("id"));
  const status = s(formData.get("status")) as TransactionStatus;
  if (!id || !validStatuses.includes(status)) redirect("/transactions");

  const tx = await db.transaction.findUnique({ where: { id } });
  if (!tx) redirect("/transactions");

  const role =
    tx.buyerId === session.user.id
      ? "BUYER"
      : tx.sellerId === session.user.id
        ? "SELLER"
        : null;
  if (!role) redirect("/transactions");

  const allowed = transitions[tx.status]?.[role] ?? [];
  if (!allowed.includes(status)) redirect("/transactions");

  await db.transaction.update({ where: { id }, data: { status } });

  if (status === "COMPLETED") {
    const listing = await db.listing.findUnique({ where: { id: tx.listingId } });
    if (listing) {
      const remaining = Math.max(0, listing.quantity - 1);
      await db.listing.update({
        where: { id: tx.listingId },
        data: { quantity: remaining, status: remaining === 0 ? "EXPIRED" : listing.status },
      });
    }
  }

  const message =
    status === "ACCEPTED"
      ? "Your transaction request was accepted."
      : status === "SHIPPED"
        ? "Your order has been shipped."
        : status === "COMPLETED"
          ? "Your transaction was marked as completed."
          : null;

  if (message) {
    await db.notification.create({
      data: {
        userId: role === "SELLER" ? tx.buyerId : tx.sellerId,
        type: "TRANSACTION",
        message,
        listingId: tx.listingId,
      },
    });
  }

  revalidatePath("/transactions");
  revalidatePath("/listings");
  redirect("/transactions");
}

export async function shipTransaction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = s(formData.get("id"));
  const trackingNumber = s(formData.get("trackingNumber")) || null;
  if (!id) redirect("/transactions");

  const tx = await db.transaction.findUnique({ where: { id } });
  if (!tx || tx.sellerId !== session.user.id) redirect("/transactions");
  if (tx.status !== "ACCEPTED" && tx.status !== "PAID") redirect("/transactions");

  await db.transaction.update({
    where: { id },
    data: { status: "SHIPPED", trackingNumber },
  });

  await db.notification.create({
    data: {
      userId: tx.buyerId,
      type: "TRANSACTION",
      message: "Your order has been shipped.",
      listingId: tx.listingId,
    },
  });

  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function updateShippingAddress(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = s(formData.get("id"));
  const shippingAddress = s(formData.get("shippingAddress")) || null;
  if (!id) redirect("/transactions");

  const tx = await db.transaction.findUnique({ where: { id } });
  if (!tx || tx.buyerId !== session.user.id) redirect("/transactions");

  await db.transaction.update({ where: { id }, data: { shippingAddress } });

  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function createReview(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const transactionId = s(formData.get("transactionId"));
  const rating = Math.round(Number(formData.get("rating")));
  const comment = s(formData.get("comment")).slice(0, 2000);
  if (!transactionId || rating < 1 || rating > 5) redirect("/transactions");

  const tx = await db.transaction.findUnique({ where: { id: transactionId } });
  if (!tx || tx.status !== "COMPLETED") redirect("/transactions");

  let reviewerId: string;
  let revieweeId: string;
  if (tx.buyerId === session.user.id) {
    reviewerId = tx.buyerId;
    revieweeId = tx.sellerId;
  } else if (tx.sellerId === session.user.id) {
    reviewerId = tx.sellerId;
    revieweeId = tx.buyerId;
  } else {
    redirect("/transactions");
  }

  const existing = await db.review.findUnique({
    where: { transactionId_reviewerId: { transactionId, reviewerId } },
  });
  if (existing) redirect("/transactions");

  await db.review.create({
    data: { transactionId, reviewerId, revieweeId, rating, comment: comment || null },
  });

  await db.notification.create({
    data: {
      userId: revieweeId,
      type: "REVIEW_RECEIVED",
      message: "You received a new review.",
      listingId: tx.listingId,
    },
  });

  revalidatePath("/transactions");
  revalidatePath(`/users/${revieweeId}`);
  redirect("/transactions");
}
