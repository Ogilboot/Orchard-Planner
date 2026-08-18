import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/messages", "/transactions", "/wantlist", "/orchard", "/records", "/saved-searches", "/following", "/profile"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}