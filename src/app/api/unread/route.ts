import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ notifications: 0, messages: 0 });
  }

  const [notifications, messages] = await Promise.all([
    db.notification.count({ where: { userId: session.user.id, read: false } }),
    db.message.count({ where: { recipientId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, messages });
}
