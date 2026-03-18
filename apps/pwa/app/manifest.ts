import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lootopia Treasure Hunter",
    short_name: "Lootopia",
    description: "Application to hunt treasures and win prizes",
    orientation: "portrait",
    start_url: "/",
    display: "fullscreen",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
