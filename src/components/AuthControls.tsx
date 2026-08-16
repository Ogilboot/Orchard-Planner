"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AuthControls({
  user,
}: {
  user: { id?: string; name?: string | null; email?: string | null } | null;
}) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-gray-600 hover:text-green-800"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="btn bg-green-800 px-3 py-1.5 text-white hover:bg-green-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {user.id ? (
        <Link href={`/users/${user.id}`} className="flex items-center gap-2 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-800 group-hover:bg-green-200">
            {initials}
          </span>
          <span className="hidden text-gray-700 group-hover:text-green-800 sm:inline">
            {user.name ?? user.email}
          </span>
        </Link>
      ) : (
        <span className="text-gray-500">{user.name ?? user.email}</span>
      )}
      <button
        onClick={() => signOut()}
        className="text-xs text-gray-400 hover:text-red-600"
      >
        Sign out
      </button>
    </div>
  );
}
