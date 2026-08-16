import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PERSONAL: "Personal",
  FOR_SALE: "For sale",
  SOLD: "Sold",
};

export default async function RecordsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your propagation records.
      </p>
    );
  }

  const records = await db.plantRecord.findMany({
    where: { userId: user.id },
    include: {
      variety: true,
      _count: { select: { plantNotes: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Propagation records</h1>
          <p className="text-sm text-gray-500">
            Track your own trees and stock — rootstock, scion source, graft date and notes.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/records"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
          >
            Export CSV
          </a>
          <Link
            href="/records/new"
            className="rounded-lg bg-green-800 px-4 py-2 text-sm font-medium text-white"
          >
            New record
          </Link>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="text-gray-500">
          No records yet. Create one to start tracking a graft or plant.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {records.map((r) => (
            <li key={r.id}>
              <Link
                href={`/records/${r.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-green-800">
                    {r.variety?.commonName ?? "Unnamed plant"}
                  </span>
                  {r.rootstock && (
                    <span className="ml-2 text-sm text-gray-500">on {r.rootstock}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>{statusLabels[r.status] ?? r.status}</span>
                  <span>
                    {r._count.plantNotes} note{r._count.plantNotes === 1 ? "" : "s"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
