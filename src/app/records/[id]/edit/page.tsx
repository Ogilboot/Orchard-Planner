import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { updateRecord } from "@/lib/actions/records";

export const dynamic = "force-dynamic";

const statusOptions = [
  { value: "PERSONAL", label: "Personal / orchard tree" },
  { value: "FOR_SALE", label: "Stock intended for sale" },
  { value: "SOLD", label: "Sold" },
];

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to edit a record.
      </p>
    );
  }

  const [record, varieties, listings] = await Promise.all([
    db.plantRecord.findUnique({ where: { id } }),
    db.variety.findMany({ orderBy: { commonName: "asc" } }),
    db.listing.findMany({
      where: { userId: { not: user.id }, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { variety: true, user: true },
      take: 100,
    }),
  ]);

  if (!record || record.userId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/records/${record.id}`} className="text-sm text-green-700 hover:underline">
          ← Back to record
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit propagation record</h1>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={updateRecord}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={record.id} />

        <div>
          <label className="block text-sm font-medium">Scion variety</label>
          <select
            name="varietyId"
            defaultValue={record.varietyId ?? ""}
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
              defaultValue={record.rootstock ?? ""}
              placeholder="e.g. MM106, M27"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Rootstock source</label>
            <input
              type="text"
              name="rootstockSource"
              defaultValue={record.rootstockSource ?? ""}
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
            defaultValue={record.scionSource ?? ""}
            placeholder="e.g. traded via Facebook group"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Sourced from marketplace listing</label>
          <select
            name="sourceListingId"
            defaultValue={record.sourceListingId ?? ""}
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
              defaultValue={toDateInput(record.graftDate)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Location / plot</label>
            <input
              type="text"
              name="location"
              defaultValue={record.location ?? ""}
              placeholder="e.g. North field, row 3"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={record.status}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={record.notes ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
            Save changes
          </button>
          <Link
            href={`/records/${record.id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
