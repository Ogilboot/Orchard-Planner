import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import {
  createReview,
  setTransactionStatus,
  shipTransaction,
  updateShippingAddress,
} from "@/lib/actions/transactions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PROPOSED: "Proposed",
  ACCEPTED: "Accepted",
  PAID: "Paid",
  SHIPPED: "Shipped",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default async function TransactionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to view your transactions.
      </p>
    );
  }

  const transactions = await db.transaction.findMany({
    where: { OR: [{ buyerId: user.id }, { sellerId: user.id }] },
    include: {
      listing: { include: { variety: true } },
      buyer: true,
      seller: true,
      reviews: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Transactions</h1>

      {transactions.length === 0 ? (
        <p className="text-gray-500">
          No transactions yet. Find a listing and request to buy or trade.
        </p>
      ) : (
        <ul className="space-y-3">
          {transactions.map((tx) => {
            const amBuyer = tx.buyerId === user.id;
            const amSeller = tx.sellerId === user.id;
            const other = amBuyer ? tx.seller : tx.buyer;
            const myReview = tx.reviews.find((r) => r.reviewerId === user.id);
            const canCancel =
              (tx.status === "PROPOSED" || tx.status === "ACCEPTED" || tx.status === "SHIPPED") &&
              (amBuyer || amSeller);
            const canPay =
              stripeEnabled &&
              amBuyer &&
              tx.amountPence != null &&
              tx.status === "ACCEPTED";

            return (
              <li key={tx.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/varieties/${tx.listing.varietyId}`}
                      className="font-medium text-green-800 hover:underline"
                    >
                      {tx.listing.variety.commonName}
                    </Link>
                    <div className="mt-1 text-sm text-gray-500">
                      {amBuyer ? "Buying from" : "Selling to"}{" "}
                      <Link
                        href={`/users/${other.id}`}
                        className="text-green-700 hover:underline"
                      >
                        {other.name ?? other.email}
                      </Link>
                      <span className="mx-1">·</span>
                      {tx.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold">
                      {tx.amountPence != null
                        ? `£${(tx.amountPence / 100).toFixed(2)}`
                        : "Trade"}
                      {tx.postagePence != null && (
                        <span className="text-xs font-normal text-gray-500">
                          {" "}
                          + £{(tx.postagePence / 100).toFixed(2)} postage
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        tx.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : tx.status === "CANCELLED"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {statusLabels[tx.status] ?? tx.status}
                    </span>
                  </div>
                </div>

                {tx.trackingNumber && (
                  <p className="mt-2 text-sm text-gray-600">
                    Tracking: <span className="font-mono">{tx.trackingNumber}</span>
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {tx.status === "PROPOSED" && amSeller && (
                    <>
                      <form action={setTransactionStatus}>
                        <input type="hidden" name="id" value={tx.id} />
                        <input type="hidden" name="status" value="ACCEPTED" />
                        <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                          Accept
                        </button>
                      </form>
                      <form action={setTransactionStatus}>
                        <input type="hidden" name="id" value={tx.id} />
                        <input type="hidden" name="status" value="CANCELLED" />
                        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                          Decline
                        </button>
                      </form>
                    </>
                  )}

                  {amSeller && (tx.status === "ACCEPTED" || tx.status === "PAID") && (
                    <>
                      <form
                        action={shipTransaction}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input type="hidden" name="id" value={tx.id} />
                        <input
                          type="text"
                          name="trackingNumber"
                          placeholder="Tracking number (optional)"
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                        />
                        <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                          Mark shipped
                        </button>
                      </form>
                      <form action={setTransactionStatus}>
                        <input type="hidden" name="id" value={tx.id} />
                        <input type="hidden" name="status" value="COMPLETED" />
                        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
                          Mark complete
                        </button>
                      </form>
                    </>
                  )}

                  {tx.status === "SHIPPED" && amBuyer && (
                    <form action={setTransactionStatus}>
                      <input type="hidden" name="id" value={tx.id} />
                      <input type="hidden" name="status" value="COMPLETED" />
                      <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                        Mark received
                      </button>
                    </form>
                  )}

                  {canPay && (
                    <form method="POST" action="/api/stripe/checkout">
                      <input type="hidden" name="transactionId" value={tx.id} />
                      <button className="rounded-md bg-blue-700 px-3 py-1.5 text-sm text-white">
                        Pay with card
                      </button>
                    </form>
                  )}

                  {canCancel && (
                    <form action={setTransactionStatus}>
                      <input type="hidden" name="id" value={tx.id} />
                      <input type="hidden" name="status" value="CANCELLED" />
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600">
                        Cancel
                      </button>
                    </form>
                  )}

                  {tx.status === "COMPLETED" && !myReview && (
                    <form
                      action={createReview}
                      className="flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-3"
                    >
                      <input type="hidden" name="transactionId" value={tx.id} />
                      <select
                        name="rating"
                        defaultValue="5"
                        className="rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                        aria-label="Rating"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} star{n === 1 ? "" : "s"}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        name="comment"
                        placeholder={`Leave feedback for ${other.name ?? other.email}…`}
                        className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                      />
                      <button className="rounded-md bg-green-800 px-3 py-1.5 text-sm text-white">
                        Submit review
                      </button>
                    </form>
                  )}
                  {tx.status === "COMPLETED" && myReview && (
                    <p className="text-sm text-gray-500">Review left ✓</p>
                  )}
                </div>

                {amBuyer && tx.status !== "COMPLETED" && tx.status !== "CANCELLED" && (
                  <form
                    action={updateShippingAddress}
                    className="mt-3 flex gap-2 border-t border-gray-100 pt-3"
                  >
                    <input type="hidden" name="id" value={tx.id} />
                    <input
                      type="text"
                      name="shippingAddress"
                      defaultValue={tx.shippingAddress ?? ""}
                      placeholder="Delivery address…"
                      className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                    />
                    <button className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
                      Save address
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
