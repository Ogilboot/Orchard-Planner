"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePhotoFile } from "@/lib/photo";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

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

export async function reportListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const ip = ipFromHeaders(await headers());
  if (!checkRateLimit(`report:${ip}`, 10, 60 * 60 * 1000).ok) return;

  const listingId = String(formData.get("listingId") || "");
  const reason = String(formData.get("reason") || "").trim().slice(0, 2000);
  if (!listingId || !reason) return;

  await db.report.create({
    data: { reporterId: session.user.id, listingId, reason },
  });

  revalidatePath(`/listings/${listingId}`);
  redirect(`/listings/${listingId}?reported=1`);
}

export async function reportReview(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const ip = ipFromHeaders(await headers());
  if (!checkRateLimit(`report:${ip}`, 10, 60 * 60 * 1000).ok) return;

  const reviewId = String(formData.get("reviewId") || "");
  const reason = String(formData.get("reason") || "").trim().slice(0, 2000);
  if (!reviewId || !reason) return;

  const review = await db.review.findUnique({ where: { id: reviewId } });
  if (!review) return;

  await db.report.create({
    data: { reporterId: session.user.id, reviewId, reason },
  });

  revalidatePath(`/users/${review.revieweeId}`);
  redirect(`/users/${review.revieweeId}?reported=1`);
}

export async function setReportStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as "OPEN" | "RESOLVED" | "DISMISSED";
  if (!id || !["OPEN", "RESOLVED", "DISMISSED"].includes(status)) redirect("/admin");

  await db.report.update({ where: { id }, data: { status } });

  revalidatePath("/admin");
}

export async function adminDeleteListing(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin");

  const listing = await db.listing.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!listing) redirect("/admin");

  const transactions = await db.transaction.findMany({
    where: { listingId: id },
    select: { id: true },
  });
  if (transactions.length > 0) {
    await db.review.deleteMany({
      where: { transactionId: { in: transactions.map((t) => t.id) } },
    });
    await db.transaction.deleteMany({ where: { listingId: id } });
  }

  for (const photo of listing.photos) {
    await deletePhotoFile(photo.url);
  }

  await db.listing.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath("/listings");
  revalidatePath(`/varieties/${listing.varietyId}`);
  revalidatePath(`/users/${listing.userId}`);
  redirect("/admin?ok=" + encodeURIComponent("Listing deleted."));
}

export async function adminDeleteReview(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  if (!id) redirect("/admin");

  const review = await db.review.findUnique({ where: { id } });
  if (!review) redirect("/admin");

  await db.review.delete({ where: { id } });

  revalidatePath("/admin");
  revalidatePath(`/users/${review.revieweeId}`);
  redirect("/admin?ok=" + encodeURIComponent("Review deleted."));
}

export async function setBanStatus(formData: FormData): Promise<void> {
  await requireAdmin();

  const userId = String(formData.get("userId") || "");
  const banned = formData.get("banned") === "true";
  if (!userId) redirect("/admin");

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) redirect("/admin");
  if (target.role === "ADMIN") redirect("/admin");

  await db.user.update({ where: { id: userId }, data: { banned } });

  revalidatePath("/admin");
  revalidatePath(`/users/${userId}`);
}
