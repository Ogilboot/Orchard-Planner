import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { formatListingPrice, formatMaterialType } from "@/lib/price";

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
      take: 10,
    }),
    Promise.all([
      db.variety.count(),
      db.listing.count({ where: { status: "ACTIVE" } }),
      db.user.count(),
    ]),
  ]);

  const [varietyCount, listingCount, userCount] = stats;

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-800 via-green-900 to-emerald-950 px-6 py-14 text-white sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.25) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15) 0, transparent 35%)",
          }}
        />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-widest text-green-200">
            Scion · Rootstock · Cuttings · Seeds
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Find and trade propagable plants
          </h1>
          <p className="mt-4 max-w-xl text-lg text-green-100">
            Search {varietyCount} varieties across sellers, backed by a real database of
            heritage and modern cultivars.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/varieties"
              className="btn bg-white px-5 py-2.5 text-green-900 hover:bg-green-50"
            >
              Browse varieties
            </Link>
            <Link
              href="/listings/new"
              className="btn border border-white/40 px-5 py-2.5 text-white hover:bg-white/10"
            >
              Post a listing
            </Link>
          </div>
        </div>
      </section>

      {user && (
        <section className="card flex flex-wrap items-center justify-between gap-3 border-green-200 bg-green-50 px-5 py-4">
          <p className="text-sm">
            Welcome back, <span className="font-semibold">{user.name ?? user.email}</span>.
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/dashboard" className="btn bg-green-800 px-3 py-1.5 text-white hover:bg-green-700">
              Dashboard
            </Link>
            <Link href="/listings/mine" className="btn border border-green-700 px-3 py-1.5 text-green-800 hover:bg-green-100">
              My listings
            </Link>
            <Link href="/orchard" className="btn border border-green-700 px-3 py-1.5 text-green-800 hover:bg-green-100">
              My orchard
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
          <div key={label} className="card p-6 text-center">
            <div className="text-3xl font-bold text-green-800">{value}</div>
            <div className="mt-1 text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Recent listings</h2>
          <Link href="/listings" className="text-sm font-medium text-green-700 hover:underline">
            View all →
          </Link>
        </div>
        {recentListings.length === 0 ? (
          <p className="text-gray-500">No listings yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentListings.map((l) => (
              <li key={l.id} className="card group overflow-hidden transition-shadow hover:shadow-md">
                {l.photos[0] && (
                  <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={l.photos[0].url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <Link
                    href={`/listings/${l.id}`}
                    className="font-semibold text-green-800 hover:underline"
                  >
                    {l.variety.commonName}
                  </Link>
                  <div className="mt-1 text-sm text-gray-500">
                    <span className="capitalize">{formatMaterialType(l.type)}</span>
                    <span className="mx-1">·</span>
                    {l.user.name ?? l.user.email}
                  </div>
                  <div className="mt-2 font-semibold text-gray-900">
                    {formatListingPrice(l.tradeOnly, l.pricePence)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Popular varieties</h2>
          <Link href="/varieties" className="text-sm font-medium text-green-700 hover:underline">
            Browse all →
          </Link>
        </div>
        <ul className="flex flex-wrap gap-2">
          {popularVarieties.map((v) => (
            <li key={v.id}>
              <Link
                href={`/varieties/${v.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 shadow-sm transition-colors hover:border-green-300 hover:bg-green-50"
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
          <div key={title} className="card p-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11.5V10a1 1 0 00-2 0v3.5a1 1 0 002 0zM10 6a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
