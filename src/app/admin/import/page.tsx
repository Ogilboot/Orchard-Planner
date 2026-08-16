import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import { importVarieties } from "@/lib/actions/admin-varieties";

export const dynamic = "force-dynamic";

const TEMPLATE = [
  "commonName",
  "species",
  "chillHours",
  "hardinessZone",
  "pollinationGroup",
  "harvestWindow",
  "flavorNotes",
  "diseaseResistanceNotes",
  "originNotes",
  "selfFertile",
  "triploid",
  "diseaseRating",
  "heritage",
  "synonyms",
].join("\t");

const EXAMPLE = [
  "Cox's Orange Pippin",
  "Malus domestica",
  "600",
  "4-8",
  "3",
  "October - December",
  "Sweet, aromatic dessert apple",
  "Susceptible to scab",
  "Raised by Richard Cox, 1825",
  "false",
  "false",
  "3",
  "true",
  "Cox, Cox's Orange",
].join("\t");

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  await requireAdmin();
  const { error, ok } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/varieties" className="text-sm text-green-700 hover:underline">
          ← Back to varieties
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Bulk import varieties</h1>
        <p className="text-sm text-gray-500">
          Paste tab-separated rows (one variety per line). The first row may be a header — it is
          ignored when it matches the column names.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {ok && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {ok}
        </p>
      )}

      <form action={importVarieties} className="space-y-4">
        <textarea
          name="data"
          rows={16}
          required
          defaultValue={`${TEMPLATE}\n${EXAMPLE}`}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono text-xs"
        />
        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Import
        </button>
      </form>

      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
        <h2 className="font-semibold">Columns</h2>
        <p className="mt-1">
          commonName (required) · species · chillHours · hardinessZone · pollinationGroup ·
          harvestWindow · flavorNotes · diseaseResistanceNotes · originNotes · selfFertile
          (true/false) · triploid (true/false) · diseaseRating (1–5) · heritage (true/false) ·
          synonyms (comma-separated)
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Existing varieties are updated by common name; new ones are created.
        </p>
      </div>
    </div>
  );
}
