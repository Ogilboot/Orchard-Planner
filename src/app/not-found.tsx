import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-bold text-green-200">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-md text-gray-500">
        The page you&apos;re looking for doesn&apos;t exist or may have been removed.
      </p>
      <Link href="/" className="btn mt-6 bg-green-800 text-white hover:bg-green-700">
        Back home
      </Link>
    </div>
  );
}
