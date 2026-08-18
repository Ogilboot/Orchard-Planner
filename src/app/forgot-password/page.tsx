import Link from "next/link";
import { requestPasswordReset } from "@/lib/actions/auth";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="mx-auto max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="card mt-6 space-y-2 p-6 text-center">
          <p className="text-sm text-green-700">
            If an account exists for that email, a reset link is on its way. Check your inbox.
          </p>
          <Link href="/login" className="text-sm font-medium text-green-700 hover:underline">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form action={requestPasswordReset} className="card mt-6 space-y-4 p-6">
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
          <button className="btn w-full bg-green-800 text-white hover:bg-green-700">
            Send reset link
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-green-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}