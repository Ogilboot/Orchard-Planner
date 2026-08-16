import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { deleteSavedSearch } from "@/lib/actions/saved-search";

export const dynamic = "force-dynamic";

function searchHref(query: string): string {
  try {
    const parsed = JSON.parse(query) as Record<string, string>;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(parsed)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/listings?${qs}` : "/listings";
  } catch {
    return "/listings";
  }
}

export default async function SavedSearchesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your saved searches.
      </p>
    );
  }

  const searches = await db.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Saved searches</h1>

      {searches.length === 0 ? (
        <p className="text-gray-500">
          No saved searches yet. Filter listings, then use &quot;Save search&quot; on the browse
          page.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {searches.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <Link
                  href={searchHref(s.query)}
                  className="font-medium text-green-800 hover:underline"
                >
                  {s.name}
                </Link>
                <p className="text-xs text-gray-500">
                  {s.createdAt.toLocaleDateString()} · {s.query}
                </p>
              </div>
              <form action={deleteSavedSearch}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-sm text-gray-500 hover:text-red-600">Delete</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
