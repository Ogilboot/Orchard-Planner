import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { updateListing } from "@/lib/actions/listings";

export const dynamic = "force-dynamic";

const materialTypes = [
  { value: "SCION_WOOD", label: "Scion wood" },
  { value: "ROOTSTOCK", label: "Rootstock" },
  { value: "HARDWOOD_CUTTING", label: "Hardwood cutting" },
  { value: "ROOTED_CUTTING", label: "Rooted cutting" },
  { value: "POTTED_TREE", label: "Potted tree" },
  { value: "SEED", label: "Seed" },
  { value: "DIVISION", label: "Division / tuber / rhizome" },
];

function toDateInput(d: Date | null): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

export default async function EditListingPage({
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
        to edit a listing.
      </p>
    );
  }

  const [listing, varieties] = await Promise.all([
    db.listing.findUnique({ where: { id } }),
    db.variety.findMany({ orderBy: { commonName: "asc" } }),
  ]);

  if (!listing || listing.userId !== user.id) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/listings/mine" className="text-sm text-green-700 hover:underline">
          ← Back to my listings
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit listing</h1>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={updateListing}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <input type="hidden" name="id" value={listing.id} />

        <div>
          <label className="block text-sm font-medium">Variety</label>
          <select
            name="varietyId"
            required
            defaultValue={listing.varietyId}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {varieties.map((v) => (
              <option key={v.id} value={v.id}>
                {v.commonName}
                {v.species ? ` — ${v.species}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Material type</label>
          <select
            name="type"
            required
            defaultValue={listing.type}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            {materialTypes.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Quantity</label>
          <input
            type="number"
            name="quantity"
            min={1}
            defaultValue={listing.quantity}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="tradeOnly"
            id="tradeOnly"
            defaultChecked={listing.tradeOnly}
            className="h-4 w-4"
          />
          <label htmlFor="tradeOnly" className="text-sm">
            Trade only (no price)
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium">Price (£)</label>
          <input
            type="number"
            name="price"
            min={0}
            step="0.01"
            defaultValue={listing.pricePence != null ? listing.pricePence / 100 : ""}
            placeholder="e.g. 2.50"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Postage (£, optional)</label>
          <input
            type="number"
            name="postage"
            min={0}
            step="0.01"
            defaultValue={listing.postagePence != null ? listing.postagePence / 100 : ""}
            placeholder="e.g. 3.50"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Shipping notes (optional)</label>
          <input
            type="text"
            name="shippingNotes"
            defaultValue={listing.shippingNotes ?? ""}
            placeholder="e.g. Sent first class in damp moss"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            name="location"
            defaultValue={listing.location ?? ""}
            placeholder="e.g. South Wales, UK"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Available from</label>
            <input
              type="date"
              name="availabilityStart"
              defaultValue={toDateInput(listing.availabilityStart)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Available until</label>
            <input
              type="date"
              name="availabilityEnd"
              defaultValue={toDateInput(listing.availabilityEnd)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={listing.description ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
            Save changes
          </button>
          <Link
            href={`/listings/${listing.id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
