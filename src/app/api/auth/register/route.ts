import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { indexUser } from "@/lib/fts";
import { emailIsConfigured, buildAbsoluteUrl, sendVerificationEmail } from "@/lib/mail";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

const VERIFY_TOKEN_TTL = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

const schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  const limited = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many registration attempts. Try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input. Name, valid email and a password of 8+ characters are required." },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email: email.toLowerCase(), passwordHash },
  });

  await indexUser({ id: user.id, name: user.name, location: null, bio: null });

  if (emailIsConfigured()) {
    const token = randomBytes(32).toString("hex");
    await db.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + VERIFY_TOKEN_TTL),
      },
    });
    await sendVerificationEmail(user.email, buildAbsoluteUrl(`/verify-email?token=${token}`));
    return NextResponse.json({ ok: true, verifyEmail: true });
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  return NextResponse.json({ ok: true });
}
