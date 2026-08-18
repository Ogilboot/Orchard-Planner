"use server";

import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { buildAbsoluteUrl, sendPasswordResetEmail } from "@/lib/mail";

const RESET_TOKEN_TTL = 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(formData: FormData): Promise<void> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) redirect("/forgot-password");

  const user = await db.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = randomBytes(32).toString("hex");
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL),
      },
    });
    await sendPasswordResetEmail(user.email, buildAbsoluteUrl(`/reset-password?token=${token}`));
    logger.info({ userId: user.id }, "password reset email requested");
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPassword(formData: FormData): Promise<void> {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!token || password.length < 8) redirect("/reset-password?error=invalid");
  if (password !== confirm) redirect(`/reset-password?token=${token}&error=mismatch`);

  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.expiresAt < new Date()) {
    redirect("/reset-password?error=expired");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.$transaction([
    db.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
  ]);

  redirect("/login?reset=1");
}

export async function verifyEmail(formData: FormData): Promise<void> {
  const token = String(formData.get("token") || "");
  if (!token) redirect("/verify-email?error=invalid");

  const record = await db.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.expiresAt < new Date()) {
    redirect("/verify-email?error=expired");
  }

  await db.$transaction([
    db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
    db.user.update({ where: { id: record.userId }, data: { emailVerified: new Date() } }),
  ]);

  redirect("/login?verified=1");
}