import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXTAUTH_URL || "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [varieties, rootstocks, listings, users] = await Promise.all([
    db.variety.findMany({ select: { id: true, updatedAt: true } }),
    db.rootstock.findMany({ select: { id: true, createdAt: true } }),
    db.listing.findMany({
      where: { status: "ACTIVE", user: { banned: false } },
      select: { id: true, updatedAt: true },
      take: 2000,
    }),
    db.user.findMany({
      where: { banned: false, listings: { some: { status: "ACTIVE" } } },
      select: { id: true, createdAt: true },
      take: 2000,
    }),
  ]);

  const staticRoutes = ["", "/varieties", "/rootstocks", "/listings", "/nurseries", "/search"].map(
    (path) => ({
      url: `${BASE}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  return [
    ...staticRoutes,
    ...varieties.map((v) => ({
      url: `${BASE}/varieties/${v.id}`,
      lastModified: v.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...rootstocks.map((r) => ({
      url: `${BASE}/rootstocks/${r.id}`,
      lastModified: r.createdAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...listings.map((l) => ({
      url: `${BASE}/listings/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...users.map((u) => ({
      url: `${BASE}/users/${u.id}`,
      lastModified: u.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}