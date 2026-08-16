import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    include: {
      listings: {
        where: { status: "ACTIVE" },
        include: { variety: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      reviewsReceived: {
        include: { reviewer: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) notFound();

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
                <Link
                  href={`/varieties/${l.varietyId}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {l.variety.commonName}
                </Link>
                <span className="text-sm text-gray-500">
                  {l.tradeOnly
                    ? "Trade only"
                    : l.pricePence != null
                      ? `£${(l.pricePence / 100).toFixed(2)}`
                      : "—"}
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
