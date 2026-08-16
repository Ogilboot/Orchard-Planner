import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function VarietiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
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
    include: {
      _count: { select: { listings: true } },
    },
    orderBy: { commonName: "asc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Variety database</h1>

      <form method="GET" action="/varieties" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by variety or synonym (e.g. Ashmead's Kernel)"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Search
        </button>
      </form>

      <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
        {varieties.map((v) => (
          <li key={v.id}>
            <Link
              href={`/varieties/${v.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
            >
              <div>
                <span className="font-medium text-green-800">{v.commonName}</span>
                {v.species && <span className="ml-2 text-sm text-gray-500">{v.species}</span>}
              </div>
              <span className="text-sm text-gray-500">
                {v._count.listings} listing{v._count.listings === 1 ? "" : "s"}
              </span>
            </Link>
          </li>
        ))}
        {varieties.length === 0 && (
          <li className="px-4 py-6 text-center text-gray-500">
            No varieties found{query ? ` for "${query}"` : ""}.
          </li>
        )}
      </ul>
    </div>
  );
}
