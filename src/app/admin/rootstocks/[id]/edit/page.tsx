import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/require-admin";
import RootstockForm, { type RootstockFormValue } from "@/components/admin/RootstockForm";

export const dynamic = "force-dynamic";

export default async function EditRootstockPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;

  const rootstock = await db.rootstock.findUnique({ where: { id } });
  if (!rootstock) notFound();

  const value: RootstockFormValue = {
    id: rootstock.id,
    name: rootstock.name,
    species: rootstock.species,
    vigour: rootstock.vigour,
    dwarfingClass: rootstock.dwarfingClass,
    chillHours: rootstock.chillHours,
    soilNotes: rootstock.soilNotes,
    diseaseResistanceNotes: rootstock.diseaseResistanceNotes,
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/rootstocks" className="text-sm text-green-700 hover:underline">
          ← Back to rootstocks
        </Link>
        <h1 className="mt-1 text-2xl font-bold">Edit {rootstock.name}</h1>
      </div>
      <RootstockForm rootstock={value} error={error} />
    </div>
  );
}
