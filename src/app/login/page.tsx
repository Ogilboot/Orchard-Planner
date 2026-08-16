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
    <div className="mx-auto max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back to Orchard Planner.</p>
      </div>

      <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="input mt-1 w-full"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            required
            placeholder="••••••••"
            className="input mt-1 w-full"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="btn w-full bg-green-800 text-white hover:bg-green-700"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        No account?{" "}
        <Link href="/register" className="font-medium text-green-700 hover:underline">
          Register
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-gray-400">
        Demo account: demo@example.com / password123
      </p>
    </div>
  );
}
