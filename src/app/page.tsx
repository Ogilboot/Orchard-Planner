import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [recentListings, popularVarieties, stats] = await Promise.all([
    db.listing.findMany({
      where: { status: "ACTIVE" },
      include: { variety: true, user: true, photos: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    db.variety.findMany({
      include: { _count: { select: { listings: true } } },
      orderBy: { listings: { _count: "desc" } },
      take: 8,
    }),
    Promise.all([
      db.variety.count(),
      db.listing.count({ where: { status: "ACTIVE" } }),
      db.user.count(),
    ]),
  ]);

  const [varietyCount, listingCount, userCount] = stats;

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-green-900 p-8 text-white">
        <h1 className="text-3xl font-bold">Find and trade propagable plants</h1>
        <p className="mt-2 max-w-2xl text-green-100">
          Scion wood, rootstock, hardwood cuttings, seeds and divisions — searchable across
          sellers, backed by a real variety database.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/varieties"
            className="rounded-lg bg-white px-4 py-2 font-medium text-green-900"
          >
            Browse varieties
          </Link>
          <Link
            href="/listings/new"
            className="rounded-lg border border-white px-4 py-2 font-medium text-white"
          >
            Post a listing
          </Link>
        </div>
      </section>

      {user && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm">
            Welcome back, <span className="font-semibold">{user.name ?? user.email}</span>.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/listings/mine"
              className="rounded-md border border-green-800 px-3 py-1.5 text-green-800"
            >
              My listings
            </Link>
            <Link
              href="/orchard"
              className="rounded-md border border-green-800 px-3 py-1.5 text-green-800"
            >
              My orchard
            </Link>
            <Link
              href="/wantlist"
              className="rounded-md border border-green-800 px-3 py-1.5 text-green-800"
            >
              Want list
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [`${varietyCount}`, "varieties documented"],
          [`${listingCount}`, "active listings"],
          [`${userCount}`, "growers & nurseries"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-2xl font-semibold text-green-800">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent listings</h2>
          <Link href="/listings" className="text-sm text-green-700 hover:underline">
            View all →
          </Link>
        </div>
        {recentListings.length === 0 ? (
          <p className="text-gray-500">No listings yet.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentListings.map((l) => (
              <li key={l.id} className="rounded-lg border border-gray-200 bg-white p-4">
                {l.photos[0] && (
                  <img
                    src={l.photos[0].url}
                    alt=""
                    className="mb-3 h-32 w-full rounded-md object-cover"
                  />
                )}
                <Link
                  href={`/listings/${l.id}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {l.variety.commonName}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="capitalize">
                    {l.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="mx-1">·</span>
                  {l.user.name ?? l.user.email}
                </div>
                <div className="mt-1 font-semibold">
                  {l.tradeOnly
                    ? "Trade only"
                    : l.pricePence != null
                      ? `£${(l.pricePence / 100).toFixed(2)}`
                      : "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Popular varieties</h2>
          <Link href="/varieties" className="text-sm text-green-700 hover:underline">
            Browse all →
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {popularVarieties.map((v) => (
            <li key={v.id}>
              <Link
                href={`/varieties/${v.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm hover:border-green-300"
              >
                {v.commonName}
                <span className="text-xs text-gray-400">{v._count.listings}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [
            "Search across sellers",
            "One place to search scion wood, cuttings, seeds and divisions by variety, type and location.",
          ],
          [
            "Want list",
            "Add varieties you're looking for and get notified when a matching listing goes live.",
          ],
          [
            "Provenance records",
            "Sellers list real propagation lineage, making listings more credible.",
          ],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
