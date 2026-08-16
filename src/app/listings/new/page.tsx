import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { createListing } from "@/lib/actions/listings";

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

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Post a listing</h1>
        <p>
          Please{" "}
          <Link href="/login" className="text-green-700 hover:underline">
            sign in
          </Link>{" "}
          to post a listing.
        </p>
      </div>
    );
  }

  const varieties = await db.variety.findMany({ orderBy: { commonName: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Post a listing</h1>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form
        action={createListing}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium">Variety</label>
          <select
            name="varietyId"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Select a variety…</option>
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
            defaultValue={1}
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="tradeOnly" id="tradeOnly" className="h-4 w-4" />
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
            placeholder="e.g. 2.50"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            name="location"
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
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Available until</label>
            <input
              type="date"
              name="availabilityEnd"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Post listing
        </button>
      </form>
    </div>
  );
}
