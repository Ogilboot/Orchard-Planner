import { createRootstock, updateRootstock } from "@/lib/actions/admin-rootstocks";

export interface RootstockFormValue {
  id?: string;
  name: string;
  species: string | null;
  vigour: string | null;
  dwarfingClass: string | null;
  chillHours: number | null;
  soilNotes: string | null;
  diseaseResistanceNotes: string | null;
}

export default function RootstockForm({
  rootstock,
  error,
}: {
  rootstock?: RootstockFormValue;
  error?: string;
}) {
  const action = rootstock?.id ? updateRootstock : createRootstock;
  const r = rootstock;

  return (
    <form action={action} className="max-w-2xl space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {r?.id && <input type="hidden" name="id" value={r.id} />}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={r?.name ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Species</label>
          <input
            type="text"
            name="species"
            defaultValue={r?.species ?? ""}
            placeholder="e.g. Malus"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium">Vigour</label>
          <input
            type="text"
            name="vigour"
            defaultValue={r?.vigour ?? ""}
            placeholder="e.g. Semi-vigorous"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Dwarfing class</label>
          <input
            type="text"
            name="dwarfingClass"
            defaultValue={r?.dwarfingClass ?? ""}
            placeholder="e.g. Dwarf"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Chill hours</label>
          <input
            type="number"
            name="chillHours"
            min={0}
            defaultValue={r?.chillHours ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Soil notes</label>
        <textarea
          name="soilNotes"
          rows={2}
          defaultValue={r?.soilNotes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Disease resistance notes</label>
        <textarea
          name="diseaseResistanceNotes"
          rows={2}
          defaultValue={r?.diseaseResistanceNotes ?? ""}
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
        Save rootstock
      </button>
    </form>
  );
}
