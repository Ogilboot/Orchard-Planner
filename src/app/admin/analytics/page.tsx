import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import Sparkline from "@/components/Sparkline";
import { bucketByDay } from "@/lib/analytics";
import { formatPounds } from "@/lib/price";

export const dynamic = "force-dynamic";

const DAYS = 30;

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const since = daysAgo(DAYS);

  const [
    users,
    listings,
    transactions,
    varieties,
    reviews,
    rootstocks,
    listingsTrend,
    transactionsTrend,
    usersTrend,
    topVarieties,
    statusBreakdown,
    topSellers,
  ] = await Promise.all([
    db.user.count(),
    db.listing.count(),
    db.transaction.count(),
    db.variety.count(),
    db.review.count(),
    db.rootstock.count(),
    db.listing.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.transaction.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.variety.findMany({
      include: { _count: { select: { listings: true } } },
      orderBy: { listings: { _count: "desc" } },
      take: 10,
    }),
    db.transaction.groupBy({ by: ["status"], _count: true }),
    db.transaction.groupBy({
      by: ["sellerId"],
      where: { status: "COMPLETED" },
      _sum: { amountPence: true, postagePence: true },
      _count: true,
      orderBy: { _sum: { amountPence: "desc" } },
      take: 10,
    }),
  ]);

  const sellerIds = topSellers.map((s) => s.sellerId);
  const sellers = await db.user.findMany({
    where: { id: { in: sellerIds } },
    select: { id: true, name: true, email: true },
  });
  const sellerMap = new Map(sellers.map((s) => [s.id, s.name ?? s.email]));

  const statusLabels: Record<string, string> = {
    PROPOSED: "Proposed",
    ACCEPTED: "Accepted",
    PAID: "Paid",
    SHIPPED: "Shipped",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
  };

  const totals: [string, string][] = [
    ["Users", String(users)],
    ["Listings", String(listings)],
    ["Transactions", String(transactions)],
    ["Varieties", String(varieties)],
    ["Reviews", String(reviews)],
    ["Rootstocks", String(rootstocks)],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-green-700 hover:underline">
          ← Back to admin
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500">Site-wide activity.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {totals.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Listings created (30d)
          </h2>
          <Sparkline values={bucketByDay(listingsTrend.map((l) => l.createdAt), DAYS)} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Transactions (30d)
          </h2>
          <Sparkline values={bucketByDay(transactionsTrend.map((t) => t.createdAt), DAYS)} />
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            New users (30d)
          </h2>
          <Sparkline values={bucketByDay(usersTrend.map((u) => u.createdAt), DAYS)} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Top varieties
          </h2>
          <ul className="divide-y divide-gray-100">
            {topVarieties.map((v) => (
              <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/varieties/${v.id}`} className="text-green-800 hover:underline">
                  {v.commonName}
                </Link>
                <span className="text-gray-500">{v._count.listings}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Transaction status
          </h2>
          <ul className="divide-y divide-gray-100">
            {statusBreakdown.map((s) => (
              <li key={s.status} className="flex items-center justify-between py-2 text-sm">
                <span>{statusLabels[s.status] ?? s.status}</span>
                <span className="text-gray-500">{s._count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Top sellers (revenue)
          </h2>
          <ul className="divide-y divide-gray-100">
            {topSellers.map((s) => {
              const revenue = (s._sum.amountPence ?? 0) + (s._sum.postagePence ?? 0);
              return (
                <li key={s.sellerId} className="flex items-center justify-between py-2 text-sm">
                  <Link
                    href={`/users/${s.sellerId}`}
                    className="text-green-800 hover:underline"
                  >
                    {sellerMap.get(s.sellerId) ?? "Unknown"}
                  </Link>
                  <span className="text-gray-500">
                    {formatPounds(revenue)} · {s._count} sale{s._count === 1 ? "" : "s"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
