import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import AuthControls from "@/components/AuthControls";
import UnreadIndicator from "@/components/UnreadIndicator";
import NavLink from "@/components/NavLink";

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
    <header className="sticky top-0 z-30 border-b border-gray-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/" className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-green-700"
              fill="currentColor"
              aria-hidden
            >
              <path d="M12 2c1.5 4.5 4 7 8 8-4 1-6.5 3.5-8 8-1.5-4.5-4-7-8-8 4-1 6.5-3.5 8-8z" />
            </svg>
            <span className="text-lg font-semibold tracking-tight text-green-900">
              Orchard Planner
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            {user && <NavLink href="/dashboard">Dashboard</NavLink>}
            <NavLink href="/varieties">Varieties</NavLink>
            <NavLink href="/rootstocks">Rootstocks</NavLink>
            <NavLink href="/listings">Browse</NavLink>
            <NavLink href="/orchard">My orchard</NavLink>
            <NavLink href="/records">Records</NavLink>
            <NavLink href="/listings/new">Sell / Trade</NavLink>
            {user && <NavLink href="/listings/mine">My listings</NavLink>}
            <NavLink href="/transactions">Transactions</NavLink>
            <NavLink href="/wantlist">Want list</NavLink>
            <NavLink href="/messages">Messages</NavLink>
            {user && <NavLink href="/saved-searches">Saved searches</NavLink>}
            {user && <NavLink href="/following">Following</NavLink>}
            {user && <NavLink href="/profile">Profile</NavLink>}
            {isAdmin && <NavLink href="/admin">Admin</NavLink>}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <form method="GET" action="/search" className="hidden md:block">
            <input
              type="text"
              name="q"
              placeholder="Search varieties…"
              className="input w-48 py-1.5"
            />
          </form>
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
