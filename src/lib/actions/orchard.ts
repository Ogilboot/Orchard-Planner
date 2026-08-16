"use server";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ELEMENT_TYPES } from "@/lib/orchard-types";

const elementSchema = z.object({
  type: z.enum(ELEMENT_TYPES),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive().max(1000),
  height: z.number().positive().max(1000),
  rotation: z.number().finite(),
  label: z.string().max(200).nullable(),
  varietyId: z.string().nullable(),
  rootstock: z.string().max(100).nullable(),
  color: z.string().max(30).nullable(),
  plantRecordId: z.string().nullable().optional(),
});

export type SavePlotResult = { ok: true } | { ok: false; error: string };

export async function savePlot(
  plotId: string,
  elementsJson: string,
): Promise<SavePlotResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: "Not signed in." };

  const plot = await db.plot.findUnique({ where: { id: plotId } });
  if (!plot || plot.userId !== session.user.id) {
    return { ok: false, error: "Plot not found." };
  }

  let elements: z.infer<typeof elementSchema>[];
  try {
    elements = z.array(elementSchema).parse(JSON.parse(elementsJson));
  } catch {
    return { ok: false, error: "Invalid plan data." };
  }

  await db.plotElement.deleteMany({ where: { plotId } });
  if (elements.length > 0) {
    await db.plotElement.createMany({
      data: elements.map((el) => ({ plotId, ...el })),
    });
  }

  revalidatePath("/orchard");
  return { ok: true };
}

export async function createPlot(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const name = String(formData.get("name") || "").trim() || "My orchard";

  const plot = await db.plot.create({
    data: { userId: session.user.id, name },
  });

  redirect(`/orchard?plot=${plot.id}`);
}

export async function renamePlot(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) redirect("/orchard");

  await db.plot.updateMany({
    where: { id, userId: session.user.id },
    data: { name },
  });

  revalidatePath("/orchard");
  redirect(`/orchard?plot=${id}`);
}

export async function deletePlot(formData: FormData): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const id = String(formData.get("id") || "");
  if (!id) redirect("/orchard");

  const plot = await db.plot.findUnique({ where: { id } });
  if (!plot || plot.userId !== session.user.id) redirect("/orchard");

  await db.plot.delete({ where: { id } });

  revalidatePath("/orchard");
  redirect("/orchard");
}
