import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { followUser, unfollowUser } from "@/lib/actions/follow";
import { reportReview } from "@/lib/actions/reports";
import { sendReply } from "@/lib/actions/messages";
import { formatListingPriceShort } from "@/lib/price";

export const dynamic = "force-dynamic";

function initials(name: string | null): string {
  return (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reported?: string }>;
}) {
  const { id } = await params;
  const { reported } = await searchParams;
  const viewer = await getCurrentUser();

  const user = await db.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "ACTIVE", user: { banned: false } },
        include: { variety: true, photos: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { followers: true, following: true } },
    },
  });

  if (!user) notFound();

  const [completedSales, isFollowing] = await Promise.all([
    db.transaction.count({ where: { sellerId: user.id, status: "COMPLETED" } }),
    viewer && viewer.id !== user.id
      ? db.follow.findUnique({
          where: {
            followerId_followingId: { followerId: viewer.id, followingId: user.id },
          },
          select: { id: true },
        })
      : null,
  ]);

  const avg =
    user.reviewsReceived.length > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) /
        user.reviewsReceived.length
      : 0;

  const species = [...new Set(user.listings.map((l) => l.variety.species).filter(Boolean))];

  return (
    <div className="space-y-8">
      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-green-700 to-emerald-800" />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 -mt-12 items-center justify-center rounded-full border-4 border-white bg-green-100 text-xl font-semibold text-green-800">
                {initials(user.name)}
              </span>
              <div>
                <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
                {user.isVerifiedNursery && (
                  <span className="badge mt-1 bg-green-100 text-green-800">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified nursery
                  </span>
                )}
                {user.location && (
                  <p className="mt-1 text-sm text-gray-500">{user.location}</p>
                )}
                {user.yearsActive != null && (
                  <p className="text-sm text-gray-500">
                    {user.yearsActive} years active · Member since{" "}
                    {user.createdAt.toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">
                {avg > 0 ? avg.toFixed(1) : "—"}
                <span className="text-sm font-normal text-amber-500"> ★</span>
              </div>
              <div className="text-sm text-gray-500">
                {user.reviewsReceived.length} review
                {user.reviewsReceived.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-sm text-gray-600">
            <span>
              <span className="font-semibold">{user.listings.length}</span> active listings
            </span>
            <span>
              <span className="font-semibold">{completedSales}</span> sales
            </span>
            <span>
              <span className="font-semibold">{user._count.followers}</span> followers
            </span>
            <span>
              <span className="font-semibold">{user._count.following}</span> following
            </span>
            <div className="ml-auto flex items-center gap-2">
              {viewer && viewer.id !== user.id && (
                <>
                  <form action={isFollowing ? unfollowUser : followUser}>
                    <input type="hidden" name="followingId" value={user.id} />
                    <button
                      className={`btn ${isFollowing ? "border border-gray-300 text-gray-700 hover:bg-gray-50" : "bg-green-800 text-white hover:bg-green-700"}`}
                    >
                      {isFollowing ? "Following ✓" : "Follow"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

          {user.bio && <p className="mt-3 text-sm text-gray-600">{user.bio}</p>}

          {species.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {species.map((s) => (
                <span key={s} className="badge bg-gray-100 text-gray-600">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {viewer && viewer.id !== user.id && (
        <section className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Contact {user.name ?? "seller"}
          </h2>
          <form action={sendReply} className="mt-2 flex gap-2">
            <input type="hidden" name="recipientId" value={user.id} />
            <input
              type="text"
              name="body"
              required
              placeholder="Ask a question…"
              className="input w-full"
            />
            <button className="btn bg-green-800 text-white hover:bg-green-700">
              Send
            </button>
          </form>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold">Listings</h2>
        {user.listings.length === 0 ? (
          <p className="text-gray-500">No active listings.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {user.listings.map((l) => (
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
                    <span className="capitalize">
                      {l.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                    <span className="mx-1">·</span>
                    {formatListingPriceShort(l.tradeOnly, l.pricePence)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        {user.reviewsReceived.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {user.reviewsReceived.map((r) => (
              <li key={r.id} className="card p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.reviewer.name ?? r.reviewer.email}</span>
                  <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="mt-1 text-gray-600">{r.comment}</p>}
                {viewer && viewer.id !== r.reviewerId && (
                  <div className="mt-2">
                    {reported && (
                      <p className="mb-1 text-xs text-green-700">
                        Thanks — this review has been reported.
                      </p>
                    )}
                    <details className="group">
                      <summary className="cursor-pointer text-xs text-gray-400 hover:text-red-600">
                        Report
                      </summary>
                      <form action={reportReview} className="mt-1 space-y-1">
                        <input type="hidden" name="reviewId" value={r.id} />
                        <textarea
                          name="reason"
                          required
                          rows={2}
                          placeholder="Why are you reporting this review?"
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button className="rounded-md bg-red-700 px-3 py-1 text-xs text-white">
                          Submit report
                        </button>
                      </form>
                    </details>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
