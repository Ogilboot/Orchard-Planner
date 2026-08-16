"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

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
  location: z.string().optional(),
  description: z.string().optional(),
  availabilityStart: z.string().optional(),
  availabilityEnd: z.string().optional(),
});

export async function createListing(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const tradeOnly = formData.get("tradeOnly") === "on";
  const priceStr = formData.get("price");
  const price = priceStr ? Number(String(priceStr)) : undefined;

  const parsed = schema.safeParse({
    varietyId: formData.get("varietyId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
    tradeOnly,
    price,
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
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
      location: data.location || null,
      description: data.description || null,
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

  revalidatePath("/varieties");
  revalidatePath(`/varieties/${data.varietyId}`);
  redirect(`/varieties/${data.varietyId}`);
}
