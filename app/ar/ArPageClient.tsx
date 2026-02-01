"use client";

import dynamic from "next/dynamic";

const AFrameScene = dynamic(() => import("@/components/aframe/AFrameScene").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full min-h-screen items-center justify-center bg-neutral-100">
      <p className="text-neutral-600">Chargement de la scène A-Frame…</p>
    </div>
  ),
});

export default function ArPageClient() {
  return (
    <div className="h-full w-full">
      <AFrameScene />
    </div>
  );
}
