import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { followUser, unfollowUser } from "@/lib/actions/follow";
import { reportReview } from "@/lib/actions/reports";
import { formatListingPriceShort } from "@/lib/price";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const viewer = await getCurrentUser();

  const user = await db.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        include: { variety: true, photos: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
        take: 20,
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

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
            {user.isVerifiedNursery && (
              <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                Verified nursery
              </span>
            )}
            {user.location && <p className="mt-1 text-sm text-gray-500">{user.location}</p>}
            {user.yearsActive != null && (
              <p className="text-sm text-gray-500">{user.yearsActive} years active</p>
            )}
            <p className="text-sm text-gray-500">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">
              {avg > 0 ? avg.toFixed(1) : "—"}
              <span className="text-sm text-gray-400"> / 5</span>
            </div>
            <div className="text-sm text-gray-500">
              {user.reviewsReceived.length} review
              {user.reviewsReceived.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          <span>
            <span className="font-semibold">{completedSales}</span> sales
          </span>
          <span>
            <span className="font-semibold">{user._count.followers}</span> follower
            {user._count.followers === 1 ? "" : "s"}
          </span>
          <span>
            <span className="font-semibold">{user._count.following}</span> following
          </span>
          {viewer && viewer.id !== user.id && (
            <form action={isFollowing ? unfollowUser : followUser}>
              <input type="hidden" name="followingId" value={user.id} />
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  isFollowing
                    ? "border border-gray-300 text-gray-700"
                    : "bg-green-800 text-white"
                }`}
              >
                {isFollowing ? "Following ✓" : "Follow"}
              </button>
            </form>
          )}
        </div>
        {user.bio && <p className="mt-3 text-sm text-gray-600">{user.bio}</p>}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Active listings</h2>
        {user.listings.length === 0 ? (
          <p className="text-gray-500">No active listings.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {user.listings.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  {l.photos[0] && (
                    <img
                      src={l.photos[0].url}
                      alt=""
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <Link
                    href={`/listings/${l.id}`}
                    className="font-medium text-green-800 hover:underline"
                  >
                    {l.variety.commonName}
                  </Link>
                </div>
                <span className="text-sm text-gray-500">
                  {formatListingPriceShort(l.tradeOnly, l.pricePence)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Reviews</h2>
        {user.reviewsReceived.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <ul className="space-y-2">
            {user.reviewsReceived.map((r) => (
              <li key={r.id} className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.reviewer.name ?? r.reviewer.email}</span>
                  <span className="text-amber-600">{"★".repeat(r.rating)}</span>
                </div>
                {r.comment && <p className="mt-1 text-gray-600">{r.comment}</p>}
                {viewer && viewer.id !== r.reviewerId && (
                  <form action={reportReview} className="mt-2">
                    <input type="hidden" name="reviewId" value={r.id} />
                    <button className="text-xs text-gray-400 hover:text-red-600">
                      Report
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
