import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RootstockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const rootstock = await db.rootstock.findUnique({
    where: { id },
    include: { plantRecords: { include: { variety: true }, orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!rootstock) notFound();

  const facts: [string, string][] = [
    ["Species", rootstock.species ?? "—"],
    ["Vigour", rootstock.vigour ?? "—"],
    ["Dwarfing class", rootstock.dwarfingClass ?? "—"],
    ["Chill hours", rootstock.chillHours?.toString() ?? "—"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/rootstocks" className="text-sm text-green-700 hover:underline">
          ← Back to rootstocks
        </Link>
        <h1 className="mt-2 text-3xl font-bold">{rootstock.name}</h1>
        {rootstock.species && <p className="text-gray-500">{rootstock.species}</p>}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 font-medium">{value}</div>
          </div>
        ))}
      </section>

      {(rootstock.soilNotes || rootstock.diseaseResistanceNotes) && (
        <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-5 text-sm">
          {rootstock.soilNotes && (
            <p>
              <span className="font-semibold">Soil:</span> {rootstock.soilNotes}
            </p>
          )}
          {rootstock.diseaseResistanceNotes && (
            <p>
              <span className="font-semibold">Disease resistance:</span>{" "}
              {rootstock.diseaseResistanceNotes}
            </p>
          )}
        </section>
      )}

      {rootstock.plantRecords.length > 0 && (
        <section>
          <h2 className="mb-2 text-lg font-semibold">Plants on this rootstock</h2>
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {rootstock.plantRecords.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <Link
                  href={`/records/${r.id}`}
                  className="font-medium text-green-800 hover:underline"
                >
                  {r.variety?.commonName ?? "Unnamed plant"}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
