import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import Sparkline from "@/components/Sparkline";
import { bucketByDay } from "@/lib/analytics";
import { formatPounds } from "@/lib/price";

export const dynamic = "force-dynamic";

const DAYS = 30;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your dashboard.
      </p>
    );
  }

  const since = daysAgo(DAYS);

  const [
    activeCount,
    soldCount,
    expiredCount,
    sales,
    listingsRecent,
    salesRecent,
    reviews,
    unreadMessages,
    recentTransactions,
    listingGroup,
  ] = await Promise.all([
    db.listing.count({ where: { userId: user.id, status: "ACTIVE" } }),
    db.listing.count({ where: { userId: user.id, status: "SOLD" } }),
    db.listing.count({ where: { userId: user.id, status: "EXPIRED" } }),
    db.transaction.aggregate({
      where: { sellerId: user.id, status: "COMPLETED" },
      _count: true,
      _sum: { amountPence: true, postagePence: true },
    }),
    db.listing.findMany({
      where: { userId: user.id, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    db.transaction.findMany({
      where: { sellerId: user.id, status: "COMPLETED", updatedAt: { gte: since } },
      select: { updatedAt: true },
    }),
    db.review.findMany({
      where: { revieweeId: user.id },
      include: { reviewer: true, transaction: { include: { listing: { include: { variety: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.message.count({ where: { recipientId: user.id, read: false } }),
    db.transaction.findMany({
      where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      include: { listing: { include: { variety: true } }, buyer: true, seller: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    db.listing.groupBy({
      by: ["varietyId"],
      where: { userId: user.id },
      _count: { varietyId: true },
      orderBy: { _count: { varietyId: "desc" } },
      take: 5,
    }),
  ]);

  const topVarietyIds = listingGroup.map((g) => g.varietyId);
  const topVarietyNames = await db.variety.findMany({
    where: { id: { in: topVarietyIds } },
    select: { id: true, commonName: true },
  });
  const nameMap = new Map(topVarietyNames.map((v) => [v.id, v.commonName]));

  const revenue =
    (sales._sum.amountPence ?? 0) + (sales._sum.postagePence ?? 0);
  const saleCount = sales._count;

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const listingsSpark = bucketByDay(
    listingsRecent.map((l) => l.createdAt),
    DAYS,
  );
  const salesSpark = bucketByDay(
    salesRecent.map((t) => t.updatedAt),
    DAYS,
  );

  const metrics: [string, string][] = [
    ["Active listings", String(activeCount)],
    ["Sold", String(soldCount)],
    ["Expired", String(expiredCount)],
    ["Completed sales", String(saleCount)],
    ["Revenue", formatPounds(revenue)],
    ["Average rating", avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "—"],
    ["Unread messages", String(unreadMessages)],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Your nursery at a glance.</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/listings/new"
            className="rounded-lg bg-green-800 px-4 py-2 text-sm text-white"
          >
            Post a listing
          </Link>
          <a
            href="/api/export/sales"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700"
          >
            Export sales
          </a>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Listings created (last {DAYS} days)
          </h2>
          <Sparkline values={listingsSpark} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Sales (last {DAYS} days)
          </h2>
          <Sparkline values={salesSpark} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Top varieties
          </h2>
          {listingGroup.length === 0 ? (
            <p className="text-sm text-gray-500">No listings yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {listingGroup.map((g) => (
                <li key={g.varietyId} className="flex items-center justify-between py-2 text-sm">
                  <span>{nameMap.get(g.varietyId) ?? "Unknown"}</span>
                  <span className="text-gray-500">
                    {g._count.varietyId} listing{g._count.varietyId === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Recent reviews
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            <ul className="space-y-2">
              {reviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.reviewer.name ?? r.reviewer.email}</span>
                    <span className="text-amber-600">{"★".repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p className="text-gray-600">{r.comment}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Recent transactions
        </h2>
        {recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentTransactions.map((tx) => {
              const amBuyer = tx.buyerId === user.id;
              return (
                <li key={tx.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <span className="font-medium text-green-800">
                      {tx.listing.variety.commonName}
                    </span>
                    <span className="ml-2 text-gray-500">
                      {amBuyer ? "buying" : "selling"} · {tx.status.toLowerCase()}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    {tx.amountPence != null ? formatPounds(tx.amountPence) : "Trade"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
