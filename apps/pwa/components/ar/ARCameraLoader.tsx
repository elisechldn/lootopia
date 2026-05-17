"use client";

import dynamic from "next/dynamic";
import type { ARCameraProps } from "./ARCamera";

const ARCamera = dynamic(() => import("./ARCamera"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "relative",
        width: "100dvw",
        height: "100dvh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 14,
      }}
    >
      Chargement AR…
    </div>
  ),
});

export default function ARCameraLoader(props: ARCameraProps) {
  return <ARCamera {...props} />;

}
