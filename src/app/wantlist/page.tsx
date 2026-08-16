import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { removeWantEntry } from "@/lib/actions/wantlist";

export const dynamic = "force-dynamic";

export default async function WantListPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your want list.
      </p>
    );
  }

  const entries = await db.wantListEntry.findMany({
    where: { userId: user.id, active: true },
    include: { variety: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your want list</h1>

      {entries.length === 0 ? (
        <p className="text-gray-500">
          Nothing here yet. Browse varieties to add what you&apos;re looking for.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={`/varieties/${e.variety.id}`}
                  className="font-medium text-green-800"
                >
                  {e.variety.commonName}
                </Link>
                {e.notes && <p className="text-sm text-gray-500">{e.notes}</p>}
              </div>
              <form action={removeWantEntry}>
                <input type="hidden" name="id" value={e.id} />
                <button className="text-sm text-gray-500 hover:text-red-600">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
