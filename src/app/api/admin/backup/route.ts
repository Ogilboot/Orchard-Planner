import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBackup } from "@/lib/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { filename, size } = await createBackup();
  const file = await readFile(path.join(process.cwd(), "backups", filename));

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(size),
    },
  });
}
