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
      <Link href="/login" className="text-gray-700 hover:text-green-800">
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.id ? (
        <Link href={`/users/${user.id}`} className="text-gray-500 hover:text-green-800">
          {user.name ?? user.email}
        </Link>
      ) : (
        <span className="text-gray-500">{user.name ?? user.email}</span>
      )}
      <button
        onClick={() => signOut()}
        className="text-gray-700 hover:text-green-800"
      >
        Sign out
      </button>
    </div>
  );
}
