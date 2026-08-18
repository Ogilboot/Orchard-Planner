import Link from "next/link";
import { resetPassword } from "@/lib/actions/auth";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  const errorMessages: Record<string, string> = {
    invalid: "That link is invalid.",
    mismatch: "Passwords don't match.",
    expired: "That reset link has expired. Please request a new one.",
  };

  return (
    <div className="mx-auto max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="mt-1 text-sm text-gray-500">Your reset link is valid for one hour.</p>
      </div>

      {!token ? (
        <p className="card mt-6 p-6 text-center text-sm text-gray-600">
          This page needs a reset link.{" "}
          <Link href="/forgot-password" className="font-medium text-green-700 hover:underline">
            Request a new one
          </Link>
          .
        </p>
      ) : (
        <form action={resetPassword} className="card mt-6 space-y-4 p-6">
          <input type="hidden" name="token" value={token} />
          <div>
            <label className="label" htmlFor="password">
              New password
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
          <div>
            <label className="label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              name="confirm"
              required
              minLength={8}
              placeholder="Repeat new password"
              className="input mt-1 w-full"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{errorMessages[error] ?? "Something went wrong."}</p>
          )}
          <button className="btn w-full bg-green-800 text-white hover:bg-green-700">
            Update password
          </button>
        </form>
      )}
    </div>
  );
}