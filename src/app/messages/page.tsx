import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";

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
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>

      {messages.length === 0 ? (
        <p className="text-gray-500">
          No messages yet. Find a listing and message the seller to start a conversation.
        </p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const incoming = m.recipientId === user.id;
            return (
              <li key={m.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">
                  {incoming
                    ? `From ${m.sender.name ?? m.sender.email}`
                    : `To ${m.recipient.name ?? m.recipient.email}`}
                  {m.listing && (
                    <Link
                      href={`/varieties/${m.listing.varietyId}`}
                      className="ml-2 text-green-700 hover:underline"
                    >
                      re: {m.listing.variety.commonName}
                    </Link>
                  )}
                  <span className="ml-2">{m.sentAt.toLocaleDateString()}</span>
                </div>
                <p className="mt-1">{m.body}</p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
