"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function UnreadIndicator({
  initialNotifications,
  initialMessages,
}: {
  initialNotifications: number;
  initialMessages: number;
}) {
  const [counts, setCounts] = useState({
    notifications: initialNotifications,
    messages: initialMessages,
  });

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch("/api/unread", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setCounts({
            notifications: data.notifications ?? 0,
            messages: data.messages ?? 0,
          });
        }
      } catch {
        // ignore polling errors
      }
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const total = counts.notifications + counts.messages;

  return (
    <Link
      href="/notifications"
      className="text-gray-700 hover:text-green-800"
      aria-label="Notifications"
    >
      Notifications
      {total > 0 && (
        <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
          {total}
        </span>
      )}
    </Link>
  );
}
