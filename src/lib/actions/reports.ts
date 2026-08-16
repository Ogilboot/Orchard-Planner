"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function reportListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const listingId = String(formData.get("listingId") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!listingId || !reason) return;

  await db.report.create({
    data: { reporterId: session.user.id, listingId, reason },
  });

  revalidatePath(`/listings/${listingId}`);
}

export async function reportReview(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const reviewId = String(formData.get("reviewId") || "");
  const reason = String(formData.get("reason") || "").trim();
  if (!reviewId || !reason) return;

  await db.report.create({
    data: { reporterId: session.user.id, reviewId, reason },
  });

  revalidatePath("/admin");
}

export async function setReportStatus(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const admin = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") redirect("/");

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as "OPEN" | "RESOLVED" | "DISMISSED";
  if (!id || !["OPEN", "RESOLVED", "DISMISSED"].includes(status)) redirect("/admin");

  await db.report.update({ where: { id }, data: { status } });

  revalidatePath("/admin");
}
