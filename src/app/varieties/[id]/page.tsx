import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { addWantEntry } from "@/lib/actions/wantlist";
import { sendMessage } from "@/lib/actions/messages";
import { requestTransaction } from "@/lib/actions/transactions";

export const dynamic = "force-dynamic";

export default async function VarietyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const variety = await db.variety.findUnique({
    where: { id },
    include: {
      synonyms: true,
      listings: {
        where: { status: "ACTIVE" },
        include: { user: true, photos: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!variety) notFound();

  const user = await getCurrentUser();

  let pollinators: { id: string; commonName: string; pollinationGroup: string | null }[] = [];
  if (variety.species && variety.pollinationGroup) {
    const group = Number(variety.pollinationGroup);
    const compatibleGroups = Number.isFinite(group)
      ? new Set([group - 1, group, group + 1].filter((n) => n >= 0).map(String))
      : new Set<string>();
    pollinators = await db.variety.findMany({
      where: {
        species: variety.species,
        id: { not: variety.id },
        pollinationGroup: { not: null },
      },
      select: { id: true, commonName: true, pollinationGroup: true },
      orderBy: { commonName: "asc" },
      take: 12,
    });
    if (compatibleGroups.size > 0) {
      pollinators = pollinators.filter((p) =>
        compatibleGroups.has(p.pollinationGroup ?? ""),
      );
    }
  }

  const zoneMatches =
    user?.hardinessZone != null &&
    variety.hardinessZone != null &&
    variety.hardinessZone.includes(user.hardinessZone);

  const facts: [string, string][] = [
    ["Chill hours", variety.chillHours?.toString() ?? "—"],
    ["Hardiness zone", variety.hardinessZone ?? "—"],
    ["Pollination group", variety.pollinationGroup ?? "—"],
    ["Harvest window", variety.harvestWindow ?? "—"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/varieties" className="text-sm text-green-700 hover:underline">
          ← Back to varieties
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{variety.commonName}</h1>
        {variety.species && <p className="text-gray-500">{variety.species}</p>}
        {variety.synonyms.length > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Synonyms: {variety.synonyms.map((s) => s.name).join(", ")}
          </p>
        )}
        {zoneMatches && (
          <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            Suits your zone ({user!.hardinessZone})
          </span>
        )}
        {variety.selfFertile != null && (
          <span className="mt-2 ml-2 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
            {variety.selfFertile ? "Self-fertile" : "Needs a pollinator"}
          </span>
        )}
        {variety.triploid != null && variety.triploid && (
          <span className="mt-2 ml-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Triploid
          </span>
        )}
        {variety.heritage && (
          <span className="mt-2 ml-2 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
            Heritage
          </span>
        )}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </div>
        ))}
      </section>

      {(variety.flavorNotes ||
        variety.diseaseResistanceNotes ||
        variety.originNotes) && (
        <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-5 text-sm">
          {variety.flavorNotes && (
            <p>
              <span className="font-semibold">Flavour / use:</span> {variety.flavorNotes}
            </p>
          )}
          {variety.diseaseResistanceNotes && (
            <p>
              <span className="font-semibold">Disease resistance:</span>{" "}
              {variety.diseaseResistanceNotes}
            </p>
          )}
          {variety.originNotes && (
            <p>
              <span className="font-semibold">Origin:</span> {variety.originNotes}
            </p>
          )}
        </section>
      )}

      {pollinators.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            Pollination partners{user?.hardinessZone ? "" : ""}
          </h2>
          <p className="text-sm text-gray-500">
            Varieties of {variety.species} in a compatible flowering group.
          </p>
          <ul className="flex flex-wrap gap-2">
            {pollinators.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/varieties/${p.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm hover:border-green-300"
                >
                  {p.commonName}
                  <span className="text-xs text-gray-400">group {p.pollinationGroup}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Available listings</h2>
        {variety.listings.length === 0 ? (
          <p className="text-gray-500">No active listings right now.</p>
        ) : (
          <ul className="space-y-3">
            {variety.listings.map((l) => (
              <li key={l.id} className="rounded-lg border border-gray-200 bg-white p-4">
                {l.photos[0] && (
                  <img
                    src={l.photos[0].url}
                    alt=""
                    className="mb-3 h-28 w-28 rounded-md object-cover"
                  />
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-medium capitalize">
                      {l.type.replaceAll("_", " ").toLowerCase()}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      <Link
                        href={`/users/${l.user.id}`}
                        className="text-green-700 hover:underline"
                      >
                        {l.user.name ?? l.user.email}
                      </Link>
                    </span>
                    {l.location && (
                      <span className="ml-2 text-sm text-gray-500">· {l.location}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/listings/${l.id}`}
                      className="text-sm text-green-700 hover:underline"
                    >
                      View listing →
                    </Link>
                    <span className="font-semibold">
                      {l.tradeOnly
                        ? "Trade only"
                        : l.pricePence != null
                          ? `£${(l.pricePence / 100).toFixed(2)}`
                          : "—"}
                    </span>
                  </div>
                </div>
                {l.description && (
                  <p className="mt-2 text-sm text-gray-600">{l.description}</p>
                )}
                {user && user.id !== l.userId && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <form action={requestTransaction}>
                      <input type="hidden" name="listingId" value={l.id} />
                      <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                        {l.tradeOnly ? "Request trade" : "Buy / Request"}
                      </button>
                    </form>
                    <form action={sendMessage} className="flex flex-1 gap-2">
                      <input type="hidden" name="listingId" value={l.id} />
                      <input
                        type="text"
                        name="body"
                        required
                        placeholder="Message the seller…"
                        className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                        Send
                      </button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        {user ? (
          <form action={addWantEntry} className="flex items-end gap-2">
            <input type="hidden" name="varietyId" value={variety.id} />
            <div className="flex-1">
              <label className="text-xs uppercase tracking-wide text-gray-500">
                Want list notes (optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. looking for 3 sticks of scion wood"
                className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
              />
            </div>
            <button className="rounded-md border border-green-800 px-4 py-1.5 text-sm text-green-800">
              Add to want list
            </button>
          </form>
        ) : (
          <Link href="/login" className="text-sm text-green-700 hover:underline">
            Sign in to add this to your want list
          </Link>
        )}
      </section>
    </div>
  );
}
