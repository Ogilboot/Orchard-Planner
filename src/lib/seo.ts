import type { Metadata } from "next";

export function pageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Orchard Planner",
    },
    twitter: { card: "summary", title, description },
  };
}

export function siteTitle(section: string): string {
  return `${section} — Orchard Planner`;
}