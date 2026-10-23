import type { MetadataRoute } from "next";

// Makes the store installable ("Install app" / "Add to Home Screen").
// Together with public/sw.js, the installed app opens offline.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FashionHub – Product Listing Demo",
    short_name: "FashionHub",
    description: "Figma to Next.js product listing with a live API, cart and offline support.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#3a4980",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
