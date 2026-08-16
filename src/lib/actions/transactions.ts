"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { TransactionStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
  ACCEPTED: { BUYER: ["CANCELLED"], SELLER: ["COMPLETED", "CANCELLED"] },
};

function s(value: FormDataEntryValue | null): string {
  return String(value ?? "").trim();
}

export async function requestTransaction(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const listingId = s(formData.get("listingId"));
  if (!listingId) redirect("/listings");

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.status !== "ACTIVE") redirect("/listings");
  if (listing.userId === session.user.id) redirect("/listings");

  const existing = await db.transaction.findFirst({
    where: {
      listingId,
      buyerId: session.user.id,
      status: { in: ["PROPOSED", "ACCEPTED"] },
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

  if (status === "ACCEPTED" || status === "COMPLETED") {
    await db.notification.create({
      data: {
        userId: tx.buyerId,
        type: "TRANSACTION",
        message:
          status === "ACCEPTED"
            ? "Your transaction request was accepted."
            : "Your transaction was marked as completed.",
        listingId: tx.listingId,
      },
    });
  }

  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function createReview(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const transactionId = s(formData.get("transactionId"));
  const rating = Math.round(Number(formData.get("rating")));
  const comment = s(formData.get("comment"));
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

  revalidatePath("/transactions");
  revalidatePath(`/users/${revieweeId}`);
  redirect("/transactions");
}
