import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Finance",
    short_name: "Family Finance",
    description: "Track family expenses together, see where money goes, and find ways to save.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#160f22",
    theme_color: "#160f22",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
