import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { markAllRead, markNotificationRead } from "@/lib/actions/notifications";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your notifications.
      </p>
    );
  }

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    include: { listing: { include: { variety: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <form action={markAllRead}>
            <button className="text-sm text-green-700 hover:underline">
              Mark all as read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500">
          No notifications yet. Add varieties to your want list to get alerts when a matching
          listing goes live.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
                n.read ? "border-gray-200 bg-white" : "border-green-300 bg-green-50"
              }`}
            >
              <div>
                <p className={n.read ? "text-gray-700" : "font-medium text-gray-900"}>
                  {n.message}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {n.createdAt.toLocaleDateString()} · {n.createdAt.toLocaleTimeString()}
                </p>
                {n.listing && (
                  <Link
                    href={`/varieties/${n.listing.varietyId}`}
                    className="mt-1 inline-block text-sm text-green-700 hover:underline"
                  >
                    View listing
                  </Link>
                )}
              </div>
              {!n.read && (
                <form action={markNotificationRead}>
                  <input type="hidden" name="id" value={n.id} />
                  <button className="shrink-0 text-sm text-gray-500 hover:text-green-700">
                    Mark read
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
