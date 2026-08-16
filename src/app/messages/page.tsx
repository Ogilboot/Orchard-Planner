import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { sendReply } from "@/lib/actions/messages";
import MarkMessagesRead from "@/components/MarkMessagesRead";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your messages.
      </p>
    );
  }

  const messages = await db.message.findMany({
    where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
    include: {
      sender: true,
      recipient: true,
      listing: { include: { variety: true } },
    },
    orderBy: { sentAt: "asc" },
  });

  type Conversation = {
    other: { id: string; name: string | null; email: string };
    listingId: string | null;
    listingLabel: string | null;
    messages: typeof messages;
  };

  const conversations = new Map<string, Conversation>();

  for (const m of messages) {
    const outgoing = m.senderId === user.id;
    const other = outgoing ? m.recipient : m.sender;
    const existing = conversations.get(other.id);
    if (existing) {
      existing.messages.push(m);
      if (m.listingId && !existing.listingId) {
        existing.listingId = m.listingId;
        existing.listingLabel = m.listing?.variety.commonName ?? null;
      }
    } else {
      conversations.set(other.id, {
        other,
        listingId: m.listingId,
        listingLabel: m.listing?.variety.commonName ?? null,
        messages: [m],
      });
    }
  }

  const threads = [...conversations.values()].sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1].sentAt.getTime();
    const bLast = b.messages[b.messages.length - 1].sentAt.getTime();
    return bLast - aLast;
  });

  return (
    <div className="space-y-4">
      <MarkMessagesRead />
      <h1 className="text-2xl font-bold">Messages</h1>

      {threads.length === 0 ? (
        <p className="text-gray-500">
          No messages yet. Find a listing and message the seller to start a conversation.
        </p>
      ) : (
        <ul className="space-y-4">
          {threads.map((thread) => {
            const otherName = thread.other.name ?? thread.other.email;
            return (
              <li key={thread.other.id} className="rounded-lg border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div>
                    <Link
                      href={`/users/${thread.other.id}`}
                      className="font-medium text-green-800 hover:underline"
                    >
                      {otherName}
                    </Link>
                    {thread.listingLabel && (
                      <span className="ml-2 text-sm text-gray-500">
                        re:{" "}
                        <Link
                          href={`/listings/${thread.listingId}`}
                          className="text-green-700 hover:underline"
                        >
                          {thread.listingLabel}
                        </Link>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {thread.messages.length} message
                    {thread.messages.length === 1 ? "" : "s"}
                  </span>
                </div>

                <ul className="space-y-2 px-4 py-3">
                  {thread.messages.map((m) => {
                    const mine = m.senderId === user.id;
                    return (
                      <li
                        key={m.id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            mine
                              ? "bg-green-800 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p>{m.body}</p>
                          <p
                            className={`mt-1 text-xs ${
                              mine ? "text-green-200" : "text-gray-400"
                            }`}
                          >
                            {m.sentAt.toLocaleDateString()} ·{" "}
                            {m.sentAt.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <form
                  action={sendReply}
                  className="flex gap-2 border-t border-gray-100 px-4 py-3"
                >
                  <input type="hidden" name="recipientId" value={thread.other.id} />
                  {thread.listingId && (
                    <input type="hidden" name="listingId" value={thread.listingId} />
                  )}
                  <input
                    type="text"
                    name="body"
                    required
                    placeholder={`Reply to ${otherName}…`}
                    className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                    Send
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
