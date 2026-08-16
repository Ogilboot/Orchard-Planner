import { createVariety, updateVariety } from "@/lib/actions/admin-varieties";

export interface VarietyFormValue {
  id?: string;
  commonName: string;
  species: string | null;
  chillHours: number | null;
  hardinessZone: string | null;
  pollinationGroup: string | null;
  harvestWindow: string | null;
  flavorNotes: string | null;
  diseaseResistanceNotes: string | null;
  originNotes: string | null;
  selfFertile: boolean | null;
  triploid: boolean | null;
  diseaseRating: number | null;
  heritage: boolean;
  synonyms: string[];
}

function boolValue(v: boolean | null): string {
  if (v === null) return "";
  return v ? "true" : "false";
}

export default function VarietyForm({
  variety,
  error,
}: {
  variety?: VarietyFormValue;
  error?: string;
}) {
  const action = variety?.id ? updateVariety : createVariety;
  const v = variety;

  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {v?.id && <input type="hidden" name="id" value={v.id} />}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Common name</label>
          <input
            type="text"
            name="commonName"
            required
            defaultValue={v?.commonName ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Species</label>
          <input
            type="text"
            name="species"
            defaultValue={v?.species ?? ""}
            placeholder="e.g. Malus domestica"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Chill hours</label>
          <input
            type="number"
            name="chillHours"
            min={0}
            defaultValue={v?.chillHours ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Hardiness zone</label>
          <input
            type="text"
            name="hardinessZone"
            defaultValue={v?.hardinessZone ?? ""}
            placeholder="e.g. 4-8"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Pollination group</label>
          <input
            type="text"
            name="pollinationGroup"
            defaultValue={v?.pollinationGroup ?? ""}
            placeholder="e.g. 3"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Harvest window</label>
          <input
            type="text"
            name="harvestWindow"
            defaultValue={v?.harvestWindow ?? ""}
            placeholder="e.g. October - January"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Disease rating (1–5)</label>
          <input
            type="number"
            name="diseaseRating"
            min={1}
            max={5}
            defaultValue={v?.diseaseRating ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Flavour / use</label>
        <textarea
          name="flavorNotes"
          rows={2}
          defaultValue={v?.flavorNotes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Disease resistance notes</label>
        <textarea
          name="diseaseResistanceNotes"
          rows={2}
          defaultValue={v?.diseaseResistanceNotes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Origin notes</label>
        <textarea
          name="originNotes"
          rows={2}
          defaultValue={v?.originNotes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Synonyms (comma or newline separated)</label>
        <textarea
          name="synonyms"
          rows={2}
          defaultValue={v?.synonyms.join(", ")}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Self-fertile</label>
          <select
            name="selfFertile"
            defaultValue={boolValue(v?.selfFertile ?? null)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Unknown</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Triploid</label>
          <select
            name="triploid"
            defaultValue={boolValue(v?.triploid ?? null)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="">Unknown</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="heritage"
          id="heritage"
          defaultChecked={v?.heritage ?? false}
          className="h-4 w-4"
        />
        <label htmlFor="heritage" className="text-sm">
          Heritage variety
        </label>
      </div>

      <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
        Save variety
      </button>
    </form>
  );
}
