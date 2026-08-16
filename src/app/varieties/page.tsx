import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 50;

function buildQuery(
  base: Record<string, string>,
  overrides: Record<string, string | undefined>,
): string {
  const merged = { ...base, ...overrides };
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `/varieties?${qs}` : "/varieties";
}

export default async function VarietiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; species?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const species = params.species ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.VarietyWhereInput = {};
  if (query) {
    where.OR = [
      { commonName: { contains: query } },
      { species: { contains: query } },
      { synonyms: { some: { name: { contains: query } } } },
    ];
  }
  if (species) where.species = species;

  const [varieties, total, speciesList] = await Promise.all([
    db.variety.findMany({
      where,
      include: { _count: { select: { listings: true } } },
      orderBy: { commonName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    db.variety.count({ where }),
    db.variety.findMany({
      where: { species: { not: null } },
      select: { species: true },
      distinct: ["species"],
      orderBy: { species: "asc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = { q: query, species };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Variety database</h1>

      <form
        method="GET"
        action="/varieties"
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search by variety or synonym (e.g. Ashmead's Kernel)"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        <select
          name="species"
          defaultValue={species}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2"
        >
          <option value="">All species</option>
          {speciesList.map((s) => (
            <option key={s.species} value={s.species!}>
              {s.species}
            </option>
          ))}
        </select>
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

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={buildQuery(base, { page: String(page - 1) })}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
            >
              ← Previous
            </Link>
          )}
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildQuery(base, { page: String(page + 1) })}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
