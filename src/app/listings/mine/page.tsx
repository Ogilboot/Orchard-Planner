import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/get-user";
import { addListingPhoto, removeListingPhoto } from "@/lib/actions/listingPhotos";
import { deleteListing, setListingStatus } from "@/lib/actions/listings";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <p>
        Please{" "}
        <Link href="/login" className="text-green-700 hover:underline">
          sign in
        </Link>{" "}
        to manage your listings.
      </p>
    );
  }

  const listings = await db.listing.findMany({
    where: { userId: user.id },
    include: { variety: true, photos: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My listings</h1>
        <p className="text-sm text-gray-500">Add up to 4 photos per listing.</p>
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500">
          You have no listings yet.{" "}
          <Link href="/listings/new" className="text-green-700 hover:underline">
            Post one
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-6">
          {listings.map((l) => (
            <li key={l.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Link
                    href={`/varieties/${l.varietyId}`}
                    className="font-medium text-green-800 hover:underline"
                  >
                    {l.variety.commonName}
                  </Link>
                  <span className="ml-2 text-sm capitalize text-gray-500">
                    {l.type.replaceAll("_", " ").toLowerCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {l.status} · {l.photos.length}/{4} photos
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <Link
                  href={`/listings/${l.id}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                >
                  View
                </Link>
                <Link
                  href={`/listings/${l.id}/edit`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </Link>
                {l.status !== "ACTIVE" && (
                  <form action={setListingStatus}>
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="status" value="ACTIVE" />
                    <button className="rounded-md border border-green-800 px-3 py-1.5 text-green-800">
                      Relist
                    </button>
                  </form>
                )}
                {l.status === "ACTIVE" && (
                  <>
                    <form action={setListingStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="status" value="SOLD" />
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700">
                        Mark sold
                      </button>
                    </form>
                    <form action={setListingStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="status" value="EXPIRED" />
                      <button className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700">
                        Mark expired
                      </button>
                    </form>
                  </>
                )}
                <form action={deleteListing}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="rounded-md border border-red-200 px-3 py-1.5 text-red-600">
                    Delete
                  </button>
                </form>
              </div>

              {l.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {l.photos.map((p) => (
                    <div key={p.id} className="relative">
                      <img
                        src={p.url}
                        alt=""
                        className="h-20 w-20 rounded-md object-cover"
                      />
                      <form
                        action={removeListingPhoto.bind(null, p.id)}
                        className="absolute right-1 top-1"
                      >
                        <button className="rounded bg-red-600 px-1.5 py-0.5 text-xs text-white">
                          Remove
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              )}

              {l.photos.length < 4 && (
                <form
                  action={addListingPhoto.bind(null, l.id)}
                  className="mt-3 flex flex-wrap items-center gap-2"
                >
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    required
                    className="text-sm"
                  />
                  <button className="rounded-md border border-green-800 px-3 py-1.5 text-sm text-green-800">
                    Add photo
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