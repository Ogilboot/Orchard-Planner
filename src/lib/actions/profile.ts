"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { indexUser } from "@/lib/fts";

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(200).optional(),
  hardinessZone: z.string().trim().max(20).optional(),
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
    hardinessZone: formData.get("hardinessZone") || undefined,
    bio: formData.get("bio") || undefined,
    yearsActive: yearsRaw ? String(yearsRaw) : undefined,
  });

  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => i.message).join(", ");
    redirect(`/profile?error=${encodeURIComponent(message)}`);
  }

  const { name, location, hardinessZone, bio, yearsActive } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name,
      location: location || null,
      hardinessZone: hardinessZone || null,
      bio: bio || null,
      yearsActive: yearsActive ?? null,
    },
  });

  await indexUser({ id: session.user.id, name, location, bio });

  revalidatePath("/profile");
  revalidatePath(`/users/${session.user.id}`);
  redirect("/profile");
}

export async function changePassword(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const current = String(formData.get("current") || "");
  const next = String(formData.get("new") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!current || !next) {
    redirect("/profile?error=" + encodeURIComponent("Enter your current and new password."));
  }
  if (next.length < 8) {
    redirect("/profile?error=" + encodeURIComponent("New password must be 8+ characters."));
  }
  if (next !== confirm) {
    redirect("/profile?error=" + encodeURIComponent("New passwords do not match."));
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.passwordHash) {
    redirect("/profile?error=" + encodeURIComponent("This account has no password to change."));
  }

  const valid = await bcrypt.compare(current, user.passwordHash);
  if (!valid) {
    redirect("/profile?error=" + encodeURIComponent("Current password is incorrect."));
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await bcrypt.hash(next, 10) },
  });

  redirect("/profile?ok=password");
}
