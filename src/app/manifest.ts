import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orchard Planner",
    short_name: "Orchard",
    description:
      "Marketplace and variety database for scion wood, rootstock, cuttings, seeds and divisions.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#14532d",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
