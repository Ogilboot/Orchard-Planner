import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-green-900 p-8 text-white">
        <h1 className="text-3xl font-bold">Find and trade propagable plants</h1>
        <p className="mt-2 max-w-2xl text-green-100">
          Scion wood, rootstock, hardwood cuttings, seeds and divisions — searchable across
          sellers, backed by a real variety database.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/varieties"
            className="rounded-lg bg-white px-4 py-2 font-medium text-green-900"
          >
            Browse varieties
          </Link>
          <Link
            href="/listings/new"
            className="rounded-lg border border-white px-4 py-2 font-medium text-white"
          >
            Post a listing
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          [
            "Search across sellers",
            "One place to search scion wood, cuttings, seeds and divisions by variety, type and location.",
          ],
          [
            "Want list",
            "Add varieties you're looking for and get notified when a matching listing goes live.",
          ],
          [
            "Provenance records",
            "Sellers list real propagation lineage, making listings more credible.",
          ],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
