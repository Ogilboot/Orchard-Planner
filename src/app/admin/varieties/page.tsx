import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import { deleteVariety } from "@/lib/actions/admin-varieties";

export const dynamic = "force-dynamic";

export default async function AdminVarietiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; error?: string }>;
}) {
  await requireAdmin();
  const { q, error } = await searchParams;
  const query = q?.trim() ?? "";

  const varieties = await db.variety.findMany({
    where: query
      ? {
          OR: [
            { commonName: { contains: query } },
            { species: { contains: query } },
            { synonyms: { some: { name: { contains: query } } } },
          ],
        }
      : undefined,
    include: { _count: { select: { listings: true, synonyms: true } } },
    orderBy: { commonName: "asc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage varieties</h1>
          <p className="text-sm text-gray-500">
            {varieties.length} varieties shown
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/import"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
          >
            Bulk import
          </Link>
          <Link
            href="/admin/varieties/new"
            className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white"
          >
            New variety
          </Link>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form method="GET" action="/admin/varieties" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search varieties…"
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
        <button className="rounded-lg bg-green-800 px-4 py-2 text-white">Search</button>
      </form>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {varieties.map((v) => (
          <li key={v.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <Link
                href={`/varieties/${v.id}`}
                className="font-medium text-green-800 hover:underline"
              >
                {v.commonName}
              </Link>
              {v.species && <span className="ml-2 text-sm text-gray-500">{v.species}</span>}
              <span className="ml-2 text-xs text-gray-400">
                {v._count.synonyms} synonym{v._count.synonyms === 1 ? "" : "s"} ·{" "}
                {v._count.listings} listing{v._count.listings === 1 ? "" : "s"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/varieties/${v.id}/edit`}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs"
              >
                Edit
              </Link>
              <form action={deleteVariety}>
                <input type="hidden" name="id" value={v.id} />
                <button className="rounded-md border border-red-200 px-2 py-1 text-xs text-red-600">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
        {varieties.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">No varieties found.</li>
        )}
      </ul>
    </div>
  );
}
