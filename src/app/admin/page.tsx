import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { setUserRole, setVerifiedStatus } from "@/lib/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    return (
      <p>
        You don&apos;t have permission to view this page.{" "}
        <Link href="/" className="text-green-700 hover:underline">
          Back home
        </Link>
      </p>
    );
  }

  const [users, stats] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { listings: true, reviewsReceived: true } } },
    }),
    Promise.all([
      db.user.count(),
      db.listing.count(),
      db.variety.count(),
      db.transaction.count(),
    ]),
  ]);

  const [userCount, listingCount, varietyCount, transactionCount] = stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin</h1>
        <p className="text-sm text-gray-500">Site overview and user management.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          ["Users", userCount],
          ["Listings", listingCount],
          ["Varieties", varietyCount],
          ["Transactions", transactionCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">Users</h2>
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {users.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/users/${u.id}`}
                    className="font-medium text-green-800 hover:underline"
                  >
                    {u.name ?? u.email}
                  </Link>
                  {u.isVerifiedNursery && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      Verified
                    </span>
                  )}
                  {u.role === "ADMIN" && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {u.email}
                  {u.location ? ` · ${u.location}` : ""}
                  {u.yearsActive != null ? ` · ${u.yearsActive} yrs` : ""}
                  {" · "}
                  {u._count.listings} listing{u._count.listings === 1 ? "" : "s"} ·{" "}
                  {u._count.reviewsReceived} review
                  {u._count.reviewsReceived === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {u.role === "USER" ? (
                  <form action={setUserRole}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value="ADMIN" />
                    <button className="rounded-md border border-gray-300 px-2 py-1 text-xs">
                      Make admin
                    </button>
                  </form>
                ) : (
                  <form action={setUserRole}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="role" value="USER" />
                    <button className="rounded-md border border-gray-300 px-2 py-1 text-xs">
                      Remove admin
                    </button>
                  </form>
                )}
                <form action={setVerifiedStatus}>
                  <input type="hidden" name="userId" value={u.id} />
                  <input
                    type="hidden"
                    name="verified"
                    value={u.isVerifiedNursery ? "false" : "true"}
                  />
                  <button
                    className={`rounded-md border px-2 py-1 text-xs ${
                      u.isVerifiedNursery
                        ? "border-red-200 text-red-600"
                        : "border-green-800 text-green-800"
                    }`}
                  >
                    {u.isVerifiedNursery ? "Unverify" : "Verify"}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
