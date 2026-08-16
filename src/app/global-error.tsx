"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <p className="text-6xl font-bold text-red-200">Error</p>
          <h1 className="mt-4 text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-2 max-w-md text-gray-500">
            An unexpected error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            className="mt-6 rounded-lg bg-green-800 px-4 py-2 text-white hover:bg-green-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
