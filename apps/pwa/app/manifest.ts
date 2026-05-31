import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lootopia Treasure Hunter",
    short_name: "Lootopia",
    description: "Application to hunt treasures and win prizes",
    orientation: "portrait",
    start_url: "/",
    display: "standalone",
    theme_color: "#000000",
    background_color: "#000000",
    icons: [
      {
        src: "/logo_192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo_512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
}
