import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { createRecord } from "@/lib/actions/records";

export const dynamic = "force-dynamic";

export default async function NewRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to create a record.
      </p>
    );
  }

  const [varieties, listings] = await Promise.all([
    db.variety.findMany({ orderBy: { commonName: "asc" } }),
    db.listing.findMany({
      where: { userId: { not: user.id }, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { variety: true, user: true },
      take: 100,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/records" className="text-sm text-green-700 hover:underline">
          ← Back to records
        </Link>
        <h1 className="mt-1 text-2xl font-bold">New propagation record</h1>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={createRecord}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium">Scion variety</label>
          <select
            name="varietyId"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">None / rootstock only</option>
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.commonName}
                {v.species ? ` — ${v.species}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Rootstock</label>
            <input
              type="text"
              name="rootstock"
              placeholder="e.g. MM106, M27"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rootstock source</label>
            <input
              type="text"
              name="rootstockSource"
              placeholder="e.g. bought from nursery"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Scion source</label>
          <input
            type="text"
            name="scionSource"
            placeholder="e.g. traded via Facebook group"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Sourced from marketplace listing</label>
          <select
            name="sourceListingId"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">None</option>
            {listings.map((l) => (
              <option key={l.id} value={l.id}>
                {l.variety.commonName} — {l.user.name ?? l.user.email}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Graft date</label>
            <input
              type="date"
              name="graftDate"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location / plot</label>
            <input
              type="text"
              name="location"
              placeholder="e.g. North field, row 3"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue="PERSONAL"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="PERSONAL">Personal / orchard tree</option>
            <option value="FOR_SALE">Stock intended for sale</option>
            <option value="SOLD">Sold</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Save record
        </button>
      </form>
    </div>
  );
}
