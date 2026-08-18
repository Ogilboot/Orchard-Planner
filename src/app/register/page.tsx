"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

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

    const data = await res.json().catch(() => ({}));
    if (data.verifyEmail) {
      setNeedsVerification(true);
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
    <div className="mx-auto max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Join growers and nurseries trading propagable plants.
        </p>
      </div>

      {needsVerification ? (
        <div className="card mt-6 space-y-2 p-6 text-center">
          <h2 className="text-lg font-semibold">Almost there</h2>
          <p className="text-sm text-gray-600">
            We&apos;ve sent a confirmation link to your email. Click it to verify your account, then
            sign in.
          </p>
          <Link href="/login" className="text-sm font-medium text-green-700 hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-6">
          <div>
            <label className="label" htmlFor="name">
              Name or nursery name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              required
              placeholder="e.g. South Downs Nursery"
              className="input mt-1 w-full"
            />
          </div>
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
              minLength={8}
              placeholder="8+ characters"
              className="input mt-1 w-full"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={loading}
            className="btn w-full bg-green-800 text-white hover:bg-green-700"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-green-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
