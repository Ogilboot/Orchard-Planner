import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export default async function FollowingPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view the nurseries you follow.
      </p>
    );
  }

  const follows = await db.follow.findMany({
    where: { followerId: user.id },
    include: {
      following: {
        include: {
          listings: {
            where: { status: "ACTIVE" },
            include: { variety: true, photos: { orderBy: { sortOrder: "asc" } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Following</h1>

      {follows.length === 0 ? (
        <p className="text-gray-500">
          You&apos;re not following anyone yet. Visit a grower&apos;s profile and follow them to
          see their new listings here.
        </p>
      ) : (
        <ul className="space-y-6">
          {follows.map((f) => (
            <li key={f.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <Link
                  href={`/users/${f.following.id}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {f.following.name ?? f.following.email}
                </Link>
                <span className="text-sm text-gray-500">
                  {f.following.location ?? ""}
                </span>
              </div>
              {f.following.listings.length === 0 ? (
                <p className="mt-2 text-sm text-gray-500">No active listings.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {f.following.listings.map((l) => (
                    <li key={l.id} className="flex items-center gap-3">
                      {l.photos[0] && (
                        <img
                          src={l.photos[0].url}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/listings/${l.id}`}
                          className="font-medium text-green-800 hover:underline"
                        >
                          {l.variety.commonName}
                        </Link>
                        <span className="ml-2 text-xs text-gray-500">
                          {l.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        {l.tradeOnly
                          ? "Trade"
                          : l.pricePence != null
                            ? `£${(l.pricePence / 100).toFixed(2)}`
                            : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
