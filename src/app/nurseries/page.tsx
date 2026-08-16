import Link from "next/link";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { searchUsers } from "@/lib/fts";
import { buildSearchHref } from "@/lib/search";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 24;

function initials(name: string | null): string {
  return (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function NurseriesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    verified?: string;
    location?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const verified = params.verified === "only";
  const location = params.location?.trim() ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.UserWhereInput = { listings: { some: {} } };

  let rankMap = new Map<string, number>();
  if (query) {
    const matches = await searchUsers(query, 200);
    if (matches.length > 0) {
      rankMap = new Map(matches.map((m, i) => [m.id, i]));
      where.id = { in: matches.map((m) => m.id) };
    } else {
      where.OR = [
        { name: { contains: query } },
        { location: { contains: query } },
        { bio: { contains: query } },
      ];
    }
  }
  if (verified) where.isVerifiedNursery = true;
  if (location) where.location = { contains: location };

  const [allSellers, locations] = await Promise.all([
    db.user.findMany({
      where,
      include: {
        _count: { select: { listings: true, followers: true } },
        reviewsReceived: { select: { rating: true } },
      },
      orderBy: { name: "asc" },
    }),
    db.user.findMany({
      where: { listings: { some: {} }, location: { not: null } },
      select: { location: true },
      distinct: ["location"],
    }),
  ]);

  let sellers = allSellers;
  if (rankMap.size > 0) {
    sellers = [...allSellers].sort(
      (a, b) => (rankMap.get(a.id) ?? 999) - (rankMap.get(b.id) ?? 999),
    );
  }

  const total = sellers.length;
  const pageSellers = sellers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const base = { q: query, verified: params.verified ?? "", location };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nurseries &amp; growers</h1>
        <p className="text-sm text-gray-500">
          Browse sellers by name, location and verified-nursery status.
        </p>
      </div>

      <form
        method="GET"
        action="/nurseries"
        className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search nurseries…"
            className="input w-full"
          />
          <button type="submit" className="btn bg-green-800 text-white hover:bg-green-700">
            Search
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            name="location"
            defaultValue={location}
            className="input w-auto"
          >
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l.location} value={l.location!}>
                {l.location}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="verified"
              value="only"
              defaultChecked={verified}
              className="h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-600"
            />
            Verified nurseries only
          </label>
          <Link href="/nurseries" className="text-gray-500 hover:text-green-700">
            Clear
          </Link>
          <span className="ml-auto text-gray-500">
            {total} seller{total === 1 ? "" : "s"}
          </span>
        </div>
      </form>

      {pageSellers.length === 0 ? (
        <p className="text-gray-500">No nurseries match your filters.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageSellers.map((s) => {
            const count = s.reviewsReceived.length;
            const avg =
              count > 0
                ? s.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / count
                : 0;
            return (
              <li key={s.id}>
                <Link
                  href={`/users/${s.id}`}
                  className="card flex h-full flex-col p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-800">
                      {initials(s.name)}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-800">
                          {s.name ?? s.email}
                        </span>
                        {s.isVerifiedNursery && (
                          <span className="badge bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </div>
                      {s.location && (
                        <p className="text-sm text-gray-500">{s.location}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span className="text-amber-600">
                      {avg > 0 ? `${avg.toFixed(1)} ★` : "—"}
                    </span>
                    <span>{s._count.listings} listings</span>
                    <span>{s._count.followers} followers</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={buildSearchHref(base, { page: String(page - 1) }, "/nurseries")}
              className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ← Previous
            </Link>
          )}
          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={buildSearchHref(base, { page: String(page + 1) }, "/nurseries")}
              className="btn border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
