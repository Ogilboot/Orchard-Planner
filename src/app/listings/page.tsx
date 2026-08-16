import Link from "next/link";
import { Prisma, type MaterialType } from "@prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const materialTypes: { value: MaterialType; label: string }[] = [
  { value: "SCION_WOOD", label: "Scion wood" },
  { value: "ROOTSTOCK", label: "Rootstock" },
  { value: "HARDWOOD_CUTTING", label: "Hardwood cutting" },
  { value: "ROOTED_CUTTING", label: "Rooted cutting" },
  { value: "POTTED_TREE", label: "Potted tree" },
  { value: "SEED", label: "Seed" },
  { value: "DIVISION", label: "Division / tuber / rhizome" },
];

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    type?: string;
    trade?: string;
    location?: string;
    season?: string;
  }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const type = params.type ?? "";
  const trade = params.trade ?? "";
  const location = params.location?.trim() ?? "";
  const inSeason = params.season === "now";

  const where: Prisma.ListingWhereInput = { status: "ACTIVE" };

  if (q) {
    where.variety = {
      OR: [
        { commonName: { contains: q } },
        { species: { contains: q } },
        { synonyms: { some: { name: { contains: q } } } },
      ],
    };
  }
  if (materialTypes.some((m) => m.value === type)) {
    where.type = type as MaterialType;
  }
  if (trade === "only") where.tradeOnly = true;
  if (trade === "paid") where.tradeOnly = false;
  if (location) where.location = { contains: location };
  if (inSeason) {
    const now = new Date();
    where.AND = [
      { OR: [{ availabilityStart: null }, { availabilityStart: { lte: now } }] },
      { OR: [{ availabilityEnd: null }, { availabilityEnd: { gte: now } }] },
    ];
  }

  const listings = await db.listing.findMany({
    where,
    include: { variety: true, user: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Browse listings</h1>

      <form
        method="GET"
        action="/listings"
        className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Variety or synonym"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">All material types</option>
          {materialTypes.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          name="trade"
          defaultValue={trade}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">Paid &amp; trade</option>
          <option value="paid">Paid only</option>
          <option value="only">Trade only</option>
        </select>
        <input
          type="text"
          name="location"
          defaultValue={location}
          placeholder="Location (e.g. Wales)"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="season"
            value="now"
            id="season"
            defaultChecked={inSeason}
            className="h-4 w-4"
          />
          <label htmlFor="season" className="text-sm text-gray-700">
            In season now
          </label>
        </div>
        <div className="sm:col-span-2 lg:col-span-5">
          <button
            type="submit"
            className="rounded-md bg-green-800 px-4 py-2 text-sm text-white"
          >
            Search
          </button>
          <Link
            href="/listings"
            className="ml-2 text-sm text-gray-500 hover:text-green-700"
          >
            Clear
          </Link>        </div>
      </form>

      {listings.length === 0 ? (
        <p className="text-gray-500">No listings match your filters.</p>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4"
            >
              {l.photos[0] && (
                <img
                  src={l.photos[0].url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              )}
              <div className="flex-1">
                <Link
                  href={`/varieties/${l.varietyId}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {l.variety.commonName}
                </Link>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="capitalize">
                    {l.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                  <span className="mx-1">·</span>
                  <Link
                    href={`/users/${l.user.id}`}
                    className="text-green-700 hover:underline"
                  >
                    {l.user.name ?? l.user.email}
                  </Link>
                  {l.location && (
                    <>
                      <span className="mx-1">·</span>
                      {l.location}
                    </>
                  )}
                  {l.availabilityStart && l.availabilityEnd && (
                    <>
                      <span className="mx-1">·</span>
                      {l.availabilityStart.toLocaleDateString()} –{" "}
                      {l.availabilityEnd.toLocaleDateString()}
                    </>
                  )}
                </div>
                {l.description && (
                  <p className="mt-2 text-sm text-gray-600">{l.description}</p>
                )}
              </div>
              <div className="shrink-0 text-right">
                <div className="font-semibold">
                  {l.tradeOnly
                    ? "Trade only"
                    : l.pricePence != null
                      ? `£${(l.pricePence / 100).toFixed(2)}`
                      : "—"}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {l.quantity} available
                </div>
                <Link
                  href={`/listings/${l.id}`}
                  className="mt-2 inline-block text-sm text-green-700 hover:underline"
                >
                  View →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
