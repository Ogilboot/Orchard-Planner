import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { deleteRootstock } from "@/lib/actions/admin-rootstocks";

export const dynamic = "force-dynamic";

export default async function AdminRootstocksPage() {
  await requireAdmin();

  const rootstocks = await db.rootstock.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { plantRecords: true, listings: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage rootstocks</h1>
          <p className="text-sm text-gray-500">{rootstocks.length} rootstocks</p>
        </div>
        <Link
          href="/admin/rootstocks/new"
          className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white"
        >
          New rootstock
        </Link>
      </div>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {rootstocks.map((r) => (
          <li key={r.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link
                href={`/rootstocks/${r.id}`}
                className="font-medium text-green-800 hover:underline"
              >
                {r.name}
              </Link>
              {r.vigour && <span className="ml-2 text-sm text-gray-500">{r.vigour}</span>}
              <span className="ml-2 text-xs text-gray-400">
                {r._count.plantRecords} record{r._count.plantRecords === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/rootstocks/${r.id}/edit`}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                Edit
              </Link>
              <form action={deleteRootstock}>
                <input type="hidden" name="id" value={r.id} />
                <button className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {rootstocks.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">No rootstocks yet.</li>
        )}
      </ul>
    </div>
  );
}
