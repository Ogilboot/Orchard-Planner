import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return db.user.findUnique({ where: { id: session.user.id } });
}
