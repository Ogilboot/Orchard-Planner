"use server";

import { getServerSession } from "next-auth";
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
});

export type SavePlotResult = { ok: true } | { ok: false; error: string };

export async function savePlot(elementsJson: string): Promise<SavePlotResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { ok: false, error: "Not signed in." };

  let elements: z.infer<typeof elementSchema>[];
  try {
    elements = z.array(elementSchema).parse(JSON.parse(elementsJson));
  } catch {
    return { ok: false, error: "Invalid plan data." };
  }

  const plot = await db.plot.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  await db.plotElement.deleteMany({ where: { plotId: plot.id } });
  if (elements.length > 0) {
    await db.plotElement.createMany({
      data: elements.map((el) => ({ plotId: plot.id, ...el })),
    });
  }

  revalidatePath("/orchard");
  return { ok: true };
}
