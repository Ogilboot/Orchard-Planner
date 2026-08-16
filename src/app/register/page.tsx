"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name")),
        email,
        password,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const sign = await signIn("credentials", { email, password, redirect: false });

    if (sign?.error) {
      router.push("/login");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">Create an account</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-3 rounded-lg border border-gray-200 bg-white p-6"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="Name or nursery name"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
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
          minLength={8}
          placeholder="Password (8+ characters)"
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full rounded-lg bg-green-800 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
