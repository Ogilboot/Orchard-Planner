import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AuthControls from "@/components/AuthControls";
import UnreadIndicator from "@/components/UnreadIndicator";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  const unread = user
    ? await db.notification.count({ where: { userId: user.id, read: false } })
    : 0;

  const unreadMessages = user
    ? await db.message.count({ where: { recipientId: user.id, read: false } })
    : 0;

  const isAdmin = user
    ? (await db.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      }))?.role === "ADMIN"
    : false;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href="/" className="text-lg font-semibold text-green-800">
            Orchard Planner
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            {user && (
              <Link href="/dashboard" className="font-medium text-gray-700 hover:text-green-800">
                Dashboard
              </Link>
            )}
            <Link href="/varieties" className="text-gray-700 hover:text-green-800">
              Varieties
            </Link>
            <Link href="/rootstocks" className="text-gray-700 hover:text-green-800">
              Rootstocks
            </Link>
            <Link href="/listings" className="text-gray-700 hover:text-green-800">
              Browse
            </Link>
            <Link href="/orchard" className="text-gray-700 hover:text-green-800">
              My orchard
            </Link>
            <Link href="/records" className="text-gray-700 hover:text-green-800">
              Records
            </Link>
            <Link href="/listings/new" className="text-gray-700 hover:text-green-800">
              Sell / Trade
            </Link>
            {user && (
              <Link href="/listings/mine" className="text-gray-700 hover:text-green-800">
                My listings
              </Link>
            )}
            <Link href="/transactions" className="text-gray-700 hover:text-green-800">
              Transactions
            </Link>
            <Link href="/wantlist" className="text-gray-700 hover:text-green-800">
              Want list
            </Link>
            {user && (
              <Link href="/saved-searches" className="text-gray-700 hover:text-green-800">
                Saved searches
              </Link>
            )}
            {user && (
              <Link href="/following" className="text-gray-700 hover:text-green-800">
                Following
              </Link>
            )}
            <Link href="/messages" className="text-gray-700 hover:text-green-800">
              Messages
            </Link>
            {user && (
              <Link href="/profile" className="text-gray-700 hover:text-green-800">
                Profile
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-gray-700 hover:text-purple-800">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <UnreadIndicator
            initialNotifications={unread}
            initialMessages={unreadMessages}
          />
          <AuthControls
            user={user ? { id: user.id, name: user.name, email: user.email } : null}
          />
        </div>
      </div>
    </header>
  );
}
