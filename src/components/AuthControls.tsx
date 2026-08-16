"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AuthControls({
  user,
}: {
  user: { name?: string | null; email?: string | null } | null;
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
      <span className="text-gray-500">{user.name ?? user.email}</span>
      <button
        onClick={() => signOut()}
        className="text-gray-700 hover:text-green-800"
      >
        Sign out
      </button>
    </div>
  );
}
