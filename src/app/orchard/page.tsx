import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import OrchardEditor from "@/components/orchard/OrchardEditor";
import { createPlot, deletePlot, renamePlot } from "@/lib/actions/orchard";
import type { PlotElementData } from "@/lib/orchard-types";

export const dynamic = "force-dynamic";

export default async function OrchardPage({
  searchParams,
}: {
  searchParams: Promise<{ plot?: string }>;
}) {
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

  const { plot: plotParam } = await searchParams;

  const [plots, varieties] = await Promise.all([
    db.plot.findMany({
      where: { userId: user.id },
      include: { elements: true },
      orderBy: { createdAt: "asc" },
    }),
    db.variety.findMany({
      orderBy: { commonName: "asc" },
      select: { id: true, commonName: true },
    }),
  ]);

  const current = plots.find((p) => p.id === plotParam) ?? plots[0] ?? null;

  const initialElements: PlotElementData[] = (current?.elements ?? []).map((e) => ({
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
    plantRecordId: e.plantRecordId,
  }));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My orchard</h1>
        <p className="text-sm text-gray-500">
          Lay out your trees, rows, fencing, ponds, shrubs and beds on a 0.5m grid.
        </p>
      </div>

      {plots.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {plots.map((p) => (
            <Link
              key={p.id}
              href={`/orchard?plot=${p.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                current?.id === p.id
                  ? "border-green-800 bg-green-800 text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              {p.name}
            </Link>
          ))}
          <form action={createPlot} className="flex items-center gap-2">
            <input
              type="text"
              name="name"
              placeholder="New plot name…"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
            <button className="rounded-md border border-green-800 px-3 py-1.5 text-sm text-green-800">
              New plot
            </button>
          </form>
        </div>
      )}

      {current ? (
        <>
          {plots.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-3">
              <form action={renamePlot} className="flex items-center gap-2">
                <input type="hidden" name="id" value={current.id} />
                <input
                  type="text"
                  name="name"
                  defaultValue={current.name}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                />
                <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                  Rename
                </button>
              </form>
              <form action={deletePlot}>
                <input type="hidden" name="id" value={current.id} />
                <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600">
                  Delete plot
                </button>
              </form>
            </div>
          )}
          <OrchardEditor
            key={current.id}
            plotId={current.id}
            initialElements={initialElements}
            varieties={varieties}
          />
        </>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-500">
            You have no plots yet. Create one to start planning.
          </p>
          <form action={createPlot} className="mt-3 flex items-center gap-2">
            <input
              type="text"
              name="name"
              required
              placeholder="Plot name (e.g. North field)"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white">
              Create plot
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
