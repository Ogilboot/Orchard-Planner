"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { deletePhotoFile, isAcceptedPhoto, MAX_LISTING_PHOTOS, savePhoto } from "@/lib/photo";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

const materialTypes = [
  "SCION_WOOD",
  "ROOTSTOCK",
  "HARDWOOD_CUTTING",
  "ROOTED_CUTTING",
  "POTTED_TREE",
  "SEED",
  "DIVISION",
] as const;

const schema = z.object({
  varietyId: z.string().min(1),
  type: z.enum(materialTypes),
  quantity: z.coerce.number().int().min(1),
  tradeOnly: z.boolean(),
  price: z.coerce.number().min(0).optional(),
  postage: z.coerce.number().min(0).optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  shippingNotes: z.string().max(500).optional(),
  availabilityStart: z.string().optional(),
  availabilityEnd: z.string().optional(),
});

export async function createListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const ip = ipFromHeaders(await headers());
  if (!checkRateLimit(`listing:${ip}`, 10, 60 * 60 * 1000).ok) {
    redirect("/listings/new?error=" + encodeURIComponent("You're posting too quickly. Try again later."));
  }

  const tradeOnly = formData.get("tradeOnly") === "on";
  const priceStr = formData.get("price");
  const price = priceStr ? Number(String(priceStr)) : undefined;
  const postageStr = formData.get("postage");
  const postage = postageStr ? Number(String(postageStr)) : undefined;

  const parsed = schema.safeParse({
    varietyId: formData.get("varietyId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    tradeOnly,
    price,
    postage,
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    shippingNotes: formData.get("shippingNotes") || undefined,
    availabilityStart: formData.get("availabilityStart") || undefined,
    availabilityEnd: formData.get("availabilityEnd") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/listings/new?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  if (!tradeOnly && data.price === undefined) {
    redirect(
      `/listings/new?error=${encodeURIComponent(
        "Price is required unless the listing is trade-only.",
      )}`,
    );
  }

  const pricePence =
    tradeOnly || data.price === undefined ? null : Math.round(data.price * 100);

  const listing = await db.listing.create({
    data: {
      userId: session.user.id,
      varietyId: data.varietyId,
      type: data.type,
      quantity: data.quantity,
      tradeOnly,
      pricePence,
      postagePence: data.postage === undefined ? null : Math.round(data.postage * 100),
      location: data.location || null,
      description: data.description || null,
      shippingNotes: data.shippingNotes || null,
      availabilityStart: data.availabilityStart ? new Date(data.availabilityStart) : null,
      availabilityEnd: data.availabilityEnd ? new Date(data.availabilityEnd) : null,
    },
  });

  const variety = await db.variety.findUnique({
    where: { id: data.varietyId },
    select: { commonName: true },
  });

  if (variety) {
    const wanters = await db.wantListEntry.findMany({
      where: { varietyId: data.varietyId, active: true, userId: { not: session.user.id } },
      select: { userId: true },
    });
    if (wanters.length > 0) {
      await db.notification.createMany({
        data: wanters.map((w) => ({
          userId: w.userId,
          type: "WANT_LIST_MATCH",
          message: `A new listing for "${variety.commonName}" is now available.`,
          listingId: listing.id,
        })),
      });
    }
  }

  const photoFiles = (formData.getAll("photos") as File[])
    .filter(isAcceptedPhoto)
    .slice(0, MAX_LISTING_PHOTOS);

  if (photoFiles.length > 0) {
    const saved: string[] = [];
    for (const file of photoFiles) {
      const url = await savePhoto(file).catch(() => null);
      if (url) saved.push(url);
    }
    if (saved.length > 0) {
      await db.listingPhoto.createMany({
        data: saved.map((url, i) => ({ listingId: listing.id, url, sortOrder: i })),
      });
    }
  }

  revalidatePath("/varieties");
  revalidatePath(`/varieties/${data.varietyId}`);
  redirect(`/varieties/${data.varietyId}`);
}

export async function updateListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== session.user.id) redirect("/listings/mine");

  const tradeOnly = formData.get("tradeOnly") === "on";
  const priceStr = formData.get("price");
  const price = priceStr ? Number(String(priceStr)) : undefined;
  const postageStr = formData.get("postage");
  const postage = postageStr ? Number(String(postageStr)) : undefined;

  const parsed = schema.safeParse({
    varietyId: formData.get("varietyId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    tradeOnly,
    price,
    postage,
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    shippingNotes: formData.get("shippingNotes") || undefined,
    availabilityStart: formData.get("availabilityStart") || undefined,
    availabilityEnd: formData.get("availabilityEnd") || undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/listings/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  const data = parsed.data;
  if (!tradeOnly && data.price === undefined) {
    redirect(
      `/listings/${id}/edit?error=${encodeURIComponent(
        "Price is required unless the listing is trade-only.",
      )}`,
    );
  }

  const pricePence =
    tradeOnly || data.price === undefined ? null : Math.round(data.price * 100);

  await db.listing.update({
    where: { id },
    data: {
      varietyId: data.varietyId,
      type: data.type,
      quantity: data.quantity,
      tradeOnly,
      pricePence,
      postagePence: data.postage === undefined ? null : Math.round(data.postage * 100),
      location: data.location || null,
      description: data.description || null,
      shippingNotes: data.shippingNotes || null,
      availabilityStart: data.availabilityStart ? new Date(data.availabilityStart) : null,
      availabilityEnd: data.availabilityEnd ? new Date(data.availabilityEnd) : null,
    },
  });

  revalidatePath("/listings");
  revalidatePath("/listings/mine");
  revalidatePath(`/listings/${id}`);
  revalidatePath(`/varieties/${data.varietyId}`);
  redirect("/listings/mine");
}

export async function setListingStatus(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as "ACTIVE" | "SOLD" | "EXPIRED";
  if (!["ACTIVE", "SOLD", "EXPIRED"].includes(status)) redirect("/listings/mine");

  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing || listing.userId !== session.user.id) redirect("/listings/mine");

  await db.listing.update({ where: { id }, data: { status } });

  revalidatePath("/listings");
  revalidatePath("/listings/mine");
  revalidatePath(`/listings/${id}`);
  revalidatePath(`/varieties/${listing.varietyId}`);
  revalidatePath(`/users/${listing.userId}`);
  redirect("/listings/mine");
}

export async function deleteListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  const listing = await db.listing.findUnique({
    where: { id },
    include: { photos: true },
  });
  if (!listing || listing.userId !== session.user.id) redirect("/listings/mine");

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

  revalidatePath("/listings");
  revalidatePath("/listings/mine");
  revalidatePath(`/varieties/${listing.varietyId}`);
  revalidatePath(`/users/${listing.userId}`);
  redirect("/listings/mine");
}
