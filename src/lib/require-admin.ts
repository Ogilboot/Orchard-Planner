import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { db } from "./db";

export async function requireAdmin(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/");
  return session.user.id;
}
