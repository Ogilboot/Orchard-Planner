"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(form.get("email")),
      password: String(form.get("password")),
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Sign in</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-lg border border-gray-200 bg-white p-6"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="Email"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        <input
          type="password"
          name="password"
          required
          placeholder="Password"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-green-800 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        No account?{" "}
        <Link href="/register" className="text-green-700 hover:underline">
          Register
        </Link>
      </p>
      <p className="text-xs text-gray-400">Demo account: demo@example.com / password123</p>
    </div>
  );
}
