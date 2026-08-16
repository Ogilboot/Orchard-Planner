import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-green-700" fill="currentColor" aria-hidden>
              <path d="M12 2c1.5 4.5 4 7 8 8-4 1-6.5 3.5-8 8-1.5-4.5-4-7-8-8 4-1 6.5-3.5 8-8z" />
            </svg>
            <span className="text-lg font-semibold text-green-800">Orchard Planner</span>
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Find and trade scion wood, rootstock, cuttings and seeds, backed by a real variety
            database.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Explore
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/varieties" className="text-gray-600 hover:text-green-700">
                Variety database
              </Link>
            </li>
            <li>
              <Link href="/rootstocks" className="text-gray-600 hover:text-green-700">
                Rootstocks
              </Link>
            </li>
            <li>
              <Link href="/listings" className="text-gray-600 hover:text-green-700">
                Browse listings
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Grow
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/listings/new" className="text-gray-600 hover:text-green-700">
                Sell / trade
              </Link>
            </li>
            <li>
              <Link href="/orchard" className="text-gray-600 hover:text-green-700">
                My orchard
              </Link>
            </li>
            <li>
              <Link href="/records" className="text-gray-600 hover:text-green-700">
                Propagation records
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Account
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/dashboard" className="text-gray-600 hover:text-green-700">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/profile" className="text-gray-600 hover:text-green-700">
                Profile
              </Link>
            </li>
            <li>
              <Link href="/register" className="text-gray-600 hover:text-green-700">
                Create an account
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        Orchard Planner · Built for growers, nurseries and enthusiasts.
      </div>
    </footer>
  );
}
