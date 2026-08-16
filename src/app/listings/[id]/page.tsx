import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { sendMessage } from "@/lib/actions/messages";
import { requestTransaction } from "@/lib/actions/transactions";
import { reportListing } from "@/lib/actions/reports";
import { formatListingPrice, formatListingPriceShort, formatMaterialType, formatPounds } from "@/lib/price";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  ACTIVE: "Active",
  SOLD: "Sold",
  EXPIRED: "Expired",
};

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await db.listing.findUnique({
    where: { id },
    include: {
      variety: true,
      user: true,
      photos: { orderBy: { sortOrder: "asc" } },
      _count: { select: { transactions: true } },
    },
  });
  if (!listing) notFound();

  const similar = await db.listing.findMany({
    where: { varietyId: listing.varietyId, status: "ACTIVE", id: { not: listing.id } },
    include: { user: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const user = await getCurrentUser();
  const isOwner = user?.id === listing.userId;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/listings" className="text-sm text-green-700 hover:underline">
          ← Back to listings
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{listing.variety.commonName}</h1>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              listing.status === "ACTIVE"
                ? "bg-green-100 text-green-800"
                : listing.status === "SOLD"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {statusLabels[listing.status] ?? listing.status}
          </span>
        </div>
        {listing.variety.species && (
          <p className="text-gray-500">{listing.variety.species}</p>
        )}
      </div>

      {listing.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {listing.photos.map((p) => (
            <img
              key={p.id}
              src={p.url}
              alt={listing.variety.commonName}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xl font-semibold">
                  {formatListingPrice(listing.tradeOnly, listing.pricePence)}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  <span className="capitalize">{formatMaterialType(listing.type)}</span>
                  <span className="mx-1">·</span>
                  {listing.quantity} available
                </div>
              </div>
            </div>
            {listing.postagePence != null && (
              <p className="mt-3 text-sm text-gray-600">
                Postage: {formatPounds(listing.postagePence)}
              </p>
            )}
            {listing.shippingNotes && (
              <p className="mt-1 text-sm text-gray-600">
                Shipping: {listing.shippingNotes}
              </p>
            )}
            {listing.description && (
              <p className="mt-3 text-sm text-gray-600">{listing.description}</p>
            )}
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Location</dt>
                <dd className="mt-0.5">{listing.location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Availability</dt>
                <dd className="mt-0.5">
                  {listing.availabilityStart && listing.availabilityEnd
                    ? `${listing.availabilityStart.toLocaleDateString()} – ${listing.availabilityEnd.toLocaleDateString()}`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray-500">Listed</dt>
                <dd className="mt-0.5">{listing.createdAt.toLocaleDateString()}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Seller
            </h2>
            <Link
              href={`/users/${listing.user.id}`}
              className="mt-2 block font-medium text-green-800 hover:underline"
            >
              {listing.user.name ?? listing.user.email}
            </Link>
            {listing.user.isVerifiedNursery && (
              <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Verified nursery
              </span>
            )}
            {listing.user.location && (
              <p className="mt-1 text-sm text-gray-500">{listing.user.location}</p>
            )}
          </section>

          {!user && (
            <Link
              href="/login"
              className="btn w-full bg-green-800 text-white hover:bg-green-700"
            >
              Sign in to buy or message
            </Link>
          )}

          {user && isOwner && (
            <Link
              href={`/listings/${id}/edit`}
              className="btn w-full border border-green-800 text-green-800 hover:bg-green-50"
            >
              Manage this listing
            </Link>
          )}

          {user && !isOwner && listing.status === "ACTIVE" && (
            <div className="space-y-2">
              <form action={requestTransaction}>
                <input type="hidden" name="listingId" value={listing.id} />
                <button className="btn w-full bg-green-800 text-white hover:bg-green-700">
                  {listing.tradeOnly ? "Request trade" : "Buy / Request"}
                </button>
              </form>
              <form action={sendMessage} className="space-y-2">
                <input type="hidden" name="listingId" value={listing.id} />
                <textarea
                  name="body"
                  required
                  rows={3}
                  placeholder="Message the seller…"
                  className="input w-full"
                />
                <button className="btn w-full border border-gray-300 text-gray-700 hover:bg-gray-50">
                  Send message
                </button>
              </form>
            </div>
          )}

          <Link
            href={`/varieties/${listing.varietyId}`}
            className="block text-sm text-green-700 hover:underline"
          >
            View all listings for {listing.variety.commonName} →
          </Link>

          {user && !isOwner && (
            <form action={reportListing} className="mt-3">
              <input type="hidden" name="listingId" value={listing.id} />
              <button className="text-xs text-gray-400 hover:text-red-600">
                Report this listing
              </button>
            </form>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            More {listing.variety.commonName} listings
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {similar.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
              >
                {s.photos[0] && (
                  <img
                    src={s.photos[0].url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-md object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/listings/${s.id}`}
                    className="block truncate font-medium text-green-800 hover:underline"
                  >
                    {s.user.name ?? s.user.email}
                  </Link>
                  <span className="text-sm capitalize text-gray-500">
                    {s.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  {formatListingPriceShort(s.tradeOnly, s.pricePence)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
