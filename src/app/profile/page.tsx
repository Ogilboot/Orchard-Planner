import Link from "next/link";
import { getCurrentUser } from "@/lib/get-user";
import { changePassword, updateProfile } from "@/lib/actions/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; ok?: string }>;
}) {
  const { error, ok } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to edit your profile.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your profile</h1>
        <Link href={`/users/${user.id}`} className="text-sm text-green-700 hover:underline">
          View public profile →
        </Link>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {ok === "password" && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Password updated.
        </p>
      )}

      <form
        action={updateProfile}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <div>
          <label className="block text-sm font-medium">Name / nursery name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={user.name ?? ""}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            name="location"
            defaultValue={user.location ?? ""}
            placeholder="e.g. South Wales, UK"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Years active</label>
          <input
            type="number"
            name="yearsActive"
            min={0}
            max={200}
            defaultValue={user.yearsActive ?? ""}
            placeholder="e.g. 8"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={user.bio ?? ""}
            placeholder="Tell buyers about your nursery or growing practices…"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Save profile
        </button>
      </form>

      <p className="max-w-xl text-sm text-gray-500">
        Email: {user.email}
        {user.isVerifiedNursery
          ? " · Verified nursery badge is managed by the site, not editable here."
          : ""}
      </p>

      <form
        action={changePassword}
        className="max-w-xl space-y-4 rounded-lg border border-gray-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold">Change password</h2>
        <div>
          <label className="block text-sm font-medium">Current password</label>
          <input
            type="password"
            name="current"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">New password</label>
            <input
              type="password"
              name="new"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm new password</label>
            <input
              type="password"
              name="confirm"
              required
              minLength={8}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
        <button type="submit" className="rounded-lg bg-green-800 px-4 py-2 text-white">
          Update password
        </button>
      </form>
    </div>
  );
}
