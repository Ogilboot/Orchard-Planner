"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  deletePhotoFile,
  isAcceptedPhoto,
  MAX_LISTING_PHOTOS,
  savePhoto,
} from "@/lib/photo";

export async function addListingPhoto(
  listingId: string,
  formData: FormData,
): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing || listing.userId !== session.user.id) return;

  const count = await db.listingPhoto.count({ where: { listingId } });
  if (count >= MAX_LISTING_PHOTOS) return;

  const file = formData.get("photo") as File | null;
  if (!file || !isAcceptedPhoto(file)) return;

  const url = await savePhoto(file).catch(() => null);
  if (!url) return;

  await db.listingPhoto.create({ data: { listingId, url, sortOrder: count } });

  revalidatePath("/varieties");
  revalidatePath(`/varieties/${listing.varietyId}`);
  revalidatePath("/listings");
  revalidatePath("/listings/mine");
  revalidatePath(`/users/${listing.userId}`);
}

export async function removeListingPhoto(photoId: string): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return;

  const photo = await db.listingPhoto.findUnique({
    where: { id: photoId },
    include: { listing: true },
  });
  if (!photo || photo.listing.userId !== session.user.id) return;

  await deletePhotoFile(photo.url);
  await db.listingPhoto.delete({ where: { id: photoId } });

  revalidatePath("/varieties");
  revalidatePath(`/varieties/${photo.listing.varietyId}`);
  revalidatePath("/listings");
  revalidatePath("/listings/mine");
  revalidatePath(`/users/${photo.listing.userId}`);
}