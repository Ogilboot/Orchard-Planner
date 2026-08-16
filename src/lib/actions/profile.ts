"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(1000).optional(),
  yearsActive: z.coerce.number().int().min(0).max(200).optional(),
});

export async function updateProfile(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const yearsRaw = formData.get("yearsActive");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    location: formData.get("location") || undefined,
    bio: formData.get("bio") || undefined,
    yearsActive: yearsRaw ? String(yearsRaw) : undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  const { name, location, bio, yearsActive } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      location: location || null,
      bio: bio || null,
      yearsActive: yearsActive ?? null,
    },
  });

  revalidatePath("/profile");
  revalidatePath(`/users/${session.user.id}`);
  redirect("/profile");
}
