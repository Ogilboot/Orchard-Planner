import Link from "next/link";
import { verifyEmail } from "@/lib/actions/auth";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  const errorMessages: Record<string, string> = {
    invalid: "That verification link is invalid.",
    expired: "That verification link has expired. Please register again.",
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-600">
          Check your inbox for the link we sent you, or{" "}
          <Link href="/register" className="font-medium text-green-700 hover:underline">
            register again
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-1 text-sm text-gray-500">Confirm it&apos;s really you.</p>
      </div>
      <form action={verifyEmail} className="card mt-6 space-y-4 p-6">
        <input type="hidden" name="token" value={token} />
        {error && (
          <p className="text-sm text-red-600">{errorMessages[error] ?? "Something went wrong."}</p>
        )}
        <button className="btn w-full bg-green-800 text-white hover:bg-green-700">
          Verify email
        </button>
      </form>
    </div>
  );
}