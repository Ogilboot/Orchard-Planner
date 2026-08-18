import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { searchVarieties } from "@/lib/fts";
import { formatListingPriceShort, formatMaterialType } from "@/lib/price";
import { pageMetadata, siteTitle } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(
    siteTitle("Search"),
    "Search varieties, listings and rootstocks across the whole site.",
  );

}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  let varietyIds: string[] = [];
  if (query) {
    varietyIds = (await searchVarieties(query, 100)).map((m) => m.id);
  }

  const [varieties, listings, rootstocks] = await Promise.all([
    query
      ? db.variety.findMany({
          where: {
            OR: [
              { id: { in: varietyIds } },
              { commonName: { contains: query } },
              { species: { contains: query } },
              { synonyms: { some: { name: { contains: query } } } },
            ],
          },
          include: { _count: { select: { listings: true } } },
          orderBy: { commonName: "asc" },
          take: 30,
        })
      : Promise.resolve([]),
    query
      ? db.listing.findMany({
          where: {
            status: "ACTIVE",
            user: { banned: false },
            OR: [
              { varietyId: { in: varietyIds } },
              { description: { contains: query } },
              { location: { contains: query } },
            ],
          },
          include: { variety: true, user: true, photos: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 30,
        })
      : Promise.resolve([]),
    query
      ? db.rootstock.findMany({
          where: {
            OR: [
              { name: { contains: query } },
              { species: { contains: query } },
              { vigour: { contains: query } },
            ],
          },
          orderBy: { name: "asc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  const nothingFound = varieties.length === 0 && listings.length === 0 && rootstocks.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Search</h1>
        <p className="text-sm text-gray-500">
          Search varieties, listings and rootstocks across the whole site.
        </p>
      </div>

      <form method="GET" action="/search" className="flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search…"
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2"
        />
        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Search
        </button>
      </form>

      {!query ? (
        <p className="text-gray-500">Type a query above to search the site.</p>
      ) : nothingFound ? (
        <p className="text-gray-500">
          No results for &quot;{query}&quot;. Try a shorter query or check the{" "}
          <Link href="/varieties" className="text-green-700 hover:underline">
            variety database
          </Link>
          .
        </p>
      ) : (
        <>
          {varieties.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">
                Varieties ({varieties.length})
              </h2>
              <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {varieties.map((v) => (
                  <li key={v.id}>
                    <Link
                      href={`/varieties/${v.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-medium text-green-800">{v.commonName}</span>
                        {v.species && (
                          <span className="ml-2 text-sm text-gray-500">{v.species}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {v._count.listings} listing{v._count.listings === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {listings.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">
                Listings ({listings.length})
              </h2>
              <ul className="space-y-3">
                {listings.map((l) => (
                  <li
                    key={l.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4"
                  >
                    {l.photos[0] && (
                      <img
                        src={l.photos[0].url}
                        alt=""
                        className="h-12 w-12 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/listings/${l.id}`}
                        className="font-medium text-green-800 hover:underline"
                      >
                        {l.variety.commonName}
                      </Link>
                      <div className="text-sm text-gray-500">
                        <span className="capitalize">{formatMaterialType(l.type)}</span>
                        <span className="mx-1">·</span>
                        {l.user.name ?? l.user.email}
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold">
                      {formatListingPriceShort(l.tradeOnly, l.pricePence)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {rootstocks.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">
                Rootstocks ({rootstocks.length})
              </h2>
              <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {rootstocks.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/rootstocks/${r.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                    >
                      <div>
                        <span className="font-medium text-green-800">{r.name}</span>
                        {r.vigour && (
                          <span className="ml-2 text-sm text-gray-500">{r.vigour}</span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
