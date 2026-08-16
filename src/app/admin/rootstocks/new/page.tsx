import Link from "next/link";
import { requireAdmin } from "@/lib/require-admin";
import RootstockForm from "@/components/admin/RootstockForm";

export const dynamic = "force-dynamic";

export default async function NewRootstockPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { error } = await searchParams;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/rootstocks" className="text-sm text-green-700 hover:underline">
          ← Back to rootstocks
        </Link>
        <h1 className="mt-1 text-2xl font-bold">New rootstock</h1>
      </div>
      <RootstockForm error={error} />
    </div>
  );
}
