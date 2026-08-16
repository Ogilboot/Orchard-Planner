import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { checkRateLimit, ipFromHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const schema = z.object({
  message: z.string().trim().min(1).max(1000),
  stack: z.string().max(5000).optional(),
  source: z.enum(["client", "server"]).default("client"),
  path: z.string().max(200).optional(),
});

export async function POST(req: Request) {
  const ip = ipFromHeaders(req.headers);
  if (!checkRateLimit(`errorlog:${ip}`, 30, 60 * 1000).ok) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { message, stack, source, path } = parsed.data;
  logger.error({ message, source, path }, "error event reported");

  await db.errorEvent
    .create({
      data: {
        message,
        stack: stack ?? null,
        source,
        path: path ?? null,
      },
    })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
