import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import VarietyForm, { type VarietyFormValue } from "@/components/admin/VarietyForm";

export const dynamic = "force-dynamic";

export default async function EditVarietyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const variety = await db.variety.findUnique({
    where: { id },
    include: { synonyms: true },
  });
  if (!variety) notFound();

  const value: VarietyFormValue = {
    id: variety.id,
    commonName: variety.commonName,
    species: variety.species,
    chillHours: variety.chillHours,
    hardinessZone: variety.hardinessZone,
    pollinationGroup: variety.pollinationGroup,
    harvestWindow: variety.harvestWindow,
    flavorNotes: variety.flavorNotes,
    diseaseResistanceNotes: variety.diseaseResistanceNotes,
    originNotes: variety.originNotes,
    selfFertile: variety.selfFertile,
    triploid: variety.triploid,
    diseaseRating: variety.diseaseRating,
    heritage: variety.heritage,
    synonyms: variety.synonyms.map((s) => s.name),
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/varieties" className="text-sm text-green-700 hover:underline">
          ← Back to varieties
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit {variety.commonName}</h1>
      </div>
      <VarietyForm variety={value} error={error} />
    </div>
  );
}
