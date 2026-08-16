import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import VarietyForm from "@/components/admin/VarietyForm";

export const dynamic = "force-dynamic";

export default async function NewVarietyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/varieties" className="text-sm text-green-700 hover:underline">
          ← Back to varieties
        </Link>
        <h1 className="mt-1 text-2xl font-bold">New variety</h1>
      </div>
      <VarietyForm error={error} />
    </div>
  );
}
