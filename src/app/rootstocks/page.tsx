import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RootstocksPage() {
  const rootstocks = await db.rootstock.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { plantRecords: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Rootstock database</h1>
      <p className="text-sm text-gray-500">
        Reference for vigour, dwarfing and soil preferences when choosing a rootstock.
      </p>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {rootstocks.map((r) => (
          <li key={r.id}>
            <Link
              href={`/rootstocks/${r.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <span className="font-medium text-green-800">{r.name}</span>
                {r.species && <span className="ml-2 text-sm text-gray-500">{r.species}</span>}
                {r.vigour && (
                  <span className="ml-2 text-xs text-gray-400">{r.vigour}</span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {r._count.plantRecords} record{r._count.plantRecords === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
        {rootstocks.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">No rootstocks yet.</li>
        )}
      </ul>
    </div>
  );
}
