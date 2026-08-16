import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";

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
  searchParams: Promise<{
    q?: string;
    species?: string;
    zone?: string;
    pollinationGroup?: string;
    chillMin?: string;
    chillMax?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const species = params.species ?? "";
  const zone = params.zone ?? "";
  const pollinationGroup = params.pollinationGroup ?? "";
  const chillMin = Number(params.chillMin) || undefined;
  const chillMax = Number(params.chillMax) || undefined;
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
  if (zone) where.hardinessZone = { contains: zone };
  if (pollinationGroup) where.pollinationGroup = pollinationGroup;
  if (chillMin !== undefined || chillMax !== undefined) {
    where.chillHours = {
      ...(chillMin !== undefined ? { gte: chillMin } : {}),
      ...(chillMax !== undefined ? { lte: chillMax } : {}),
    };
  }

  const [varieties, total, speciesList, zoneList, groups, user] = await Promise.all([
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
    db.variety.findMany({
      where: { hardinessZone: { not: null } },
      select: { hardinessZone: true },
      distinct: ["hardinessZone"],
      orderBy: { hardinessZone: "asc" },
    }),
    db.variety.findMany({
      where: { pollinationGroup: { not: null } },
      select: { pollinationGroup: true },
      distinct: ["pollinationGroup"],
    }),
    getCurrentUser(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = {
    q: query,
    species,
    zone,
    pollinationGroup,
    chillMin: params.chillMin ?? "",
    chillMax: params.chillMax ?? "",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Variety database</h1>

      <form
        method="GET"
        action="/varieties"
        className="space-y-2 rounded-lg border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <select
            name="species"
            defaultValue={species}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">All species</option>
            {speciesList.map((s) => (
              <option key={s.species} value={s.species!}>
                {s.species}
              </option>
            ))}
          </select>
          <select
            name="zone"
            defaultValue={zone}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">All hardiness zones</option>
            {zoneList.map((z) => (
              <option key={z.hardinessZone} value={z.hardinessZone!}>
                Zone {z.hardinessZone}
              </option>
            ))}
          </select>
          <select
            name="pollinationGroup"
            defaultValue={pollinationGroup}
            className="rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">All pollination groups</option>
            {groups
              .sort((a, b) => (a.pollinationGroup ?? "").localeCompare(b.pollinationGroup ?? ""))
              .map((g) => (
                <option key={g.pollinationGroup} value={g.pollinationGroup!}>
                  Group {g.pollinationGroup}
                </option>
              ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="text-gray-500">Chill</label>
            <input
              type="number"
              name="chillMin"
              defaultValue={params.chillMin ?? ""}
              placeholder="min"
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              name="chillMax"
              defaultValue={params.chillMax ?? ""}
              placeholder="max"
              className="w-20 rounded-md border border-gray-300 px-2 py-1.5"
            />
            <span className="text-gray-500">hours</span>
          </div>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700"
          >
            Filter
          </button>
          <Link
            href="/varieties"
            className="self-center text-gray-500 hover:text-green-700"
          >
            Clear
          </Link>
        </div>
        {user?.hardinessZone && (
          <p className="text-xs text-gray-500">
            Your zone is <span className="font-medium">{user.hardinessZone}</span>.{" "}
            <Link
              href={`/varieties?zone=${encodeURIComponent(user.hardinessZone)}`}
              className="text-green-700 hover:underline"
            >
              Show varieties suited to my zone
            </Link>
          </p>
        )}
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
                {v.hardinessZone && (
                  <span className="ml-2 text-xs text-gray-400">zone {v.hardinessZone}</span>
                )}
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
