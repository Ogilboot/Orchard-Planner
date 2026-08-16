import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import OrchardEditor from "@/components/orchard/OrchardEditor";
import type { PlotElementData } from "@/lib/orchard-types";

export const dynamic = "force-dynamic";

export default async function OrchardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to plan your orchard.
      </p>
    );
  }

  const [plot, varieties] = await Promise.all([
    db.plot.findUnique({ where: { userId: user.id }, include: { elements: true } }),
    db.variety.findMany({
      orderBy: { commonName: "asc" },
      select: { id: true, commonName: true },
    }),
  ]);

  const initialElements: PlotElementData[] = (plot?.elements ?? []).map((e) => ({
    id: e.id,
    type: e.type,
    x: e.x,
    y: e.y,
    width: e.width,
    height: e.height,
    rotation: e.rotation,
    label: e.label,
    varietyId: e.varietyId,
    rootstock: e.rootstock,
    color: e.color,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My orchard</h1>
        <p className="text-sm text-gray-500">
          Lay out your trees, rows, fencing, ponds, shrubs and beds on a 0.5m grid.
        </p>
      </div>
      <OrchardEditor initialElements={initialElements} varieties={varieties} />
    </div>
  );
}
