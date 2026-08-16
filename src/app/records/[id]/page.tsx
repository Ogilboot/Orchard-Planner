import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { addNote, deleteNote, deleteRecord } from "@/lib/actions/records";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PERSONAL: "Personal",
  FOR_SALE: "For sale",
  SOLD: "Sold",
};

const kindLabels: Record<string, string> = {
  HEALTH: "Health",
  YIELD: "Yield",
  GENERAL: "General",
};

export default async function RecordDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view records.
      </p>
    );
  }

  const record = await db.plantRecord.findUnique({
    where: { id },
    include: {
      variety: true,
      rootstockRef: true,
      sourceListing: { include: { variety: true } },
      plantNotes: { orderBy: { notedAt: "desc" } },
    },
  });

  if (!record || record.userId !== user.id) notFound();

  const facts: [string, string][] = [
    ["Rootstock", record.rootstockRef?.name ?? record.rootstock ?? "—"],
    ["Rootstock source", record.rootstockSource ?? "—"],
    ["Scion source", record.scionSource ?? "—"],
    ["Graft date", record.graftDate ? record.graftDate.toLocaleDateString() : "—"],
    ["Location", record.location ?? "—"],
    ["Status", statusLabels[record.status] ?? record.status],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/records" className="text-sm text-green-700 hover:underline">
          ← Back to records
        </Link>
        <div className="mt-1 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">
              {record.variety?.commonName ?? "Unnamed plant"}
            </h1>
            {record.variety?.species && (
              <p className="text-gray-500">{record.variety.species}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/records/${record.id}/edit`}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
            >
              Edit
            </Link>
            <form action={deleteRecord}>
              <input type="hidden" name="id" value={record.id} />
              <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600">
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </div>
        ))}
      </section>

      {record.sourceListing && (
        <section className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <span className="font-semibold">Sourced from:</span>{" "}
          <Link
            href={`/varieties/${record.sourceListing.varietyId}`}
            className="text-green-700 hover:underline"
          >
            {record.sourceListing.variety.commonName}
          </Link>
        </section>
      )}

      {record.notes && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
          <p>{record.notes}</p>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Notes</h2>
        {record.plantNotes.length === 0 ? (
          <p className="text-gray-500">No notes yet.</p>
        ) : (
          <ul className="space-y-2">
            {record.plantNotes.map((n) => (
              <li
                key={n.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium uppercase tracking-wide">
                    {kindLabels[n.kind] ?? n.kind}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{n.notedAt.toLocaleDateString()}</span>
                    <form action={deleteNote}>
                      <input type="hidden" name="id" value={n.id} />
                      <button className="text-gray-400 hover:text-red-600">Remove</button>
                    </form>
                  </div>
                </div>
                <p className="mt-1">
                  {n.note}
                  {n.amount != null && (
                    <span className="ml-2 text-gray-500">({n.amount})</span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form
          action={addNote}
          className="space-y-3 rounded-lg border border-gray-200 bg-white p-4"
        >
          <input type="hidden" name="recordId" value={record.id} />
          <div className="grid gap-3 sm:grid-cols-4">
            <select
              name="kind"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="HEALTH">Health</option>
              <option value="YIELD">Yield</option>
              <option value="GENERAL">General</option>
            </select>
            <input
              type="number"
              name="amount"
              step="any"
              placeholder="Amount (optional, e.g. kg)"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-1"
            />
            <input
              type="text"
              name="note"
              required
              placeholder="Add a note…"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
            />
          </div>
          <button className="rounded-md bg-green-800 px-4 py-1.5 text-sm text-white">
            Add note
          </button>
        </form>
      </section>
    </div>
  );
}
