"use client";

import * as THREE from "three";
import { Suspense, useRef } from "react";
import { useARScene } from "../../hooks/useARScene";
import { useARStore } from "@/store/arStore";
import type { HuntGetPayload, HuntModel, SingleResult } from "@repo/types";
import { HuntOverlay } from "@/components/ar/HuntOverlay";
import Toaster from "@/components/ui/Toaster";

type HuntWithSteps = HuntGetPayload<{
  include: { steps: true };
}>;

export default function ARScene({ hunt }: { hunt: Promise<SingleResult<HuntWithSteps>> }) {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { error, refs } = useARScene({ canvasRef, videoRef });
  const coords = useARStore((s) => s.coords);

  const addItem = () => {
    console.log("addItem")
    const { locar, scene, camera } = refs.current;
    if (!locar || !scene || !camera) return;

    const mesh0 = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );

    hunt.then(data => {
      const step = data.data.steps[0];
      if (!step) throw new Error("Hunt has no step");
      locar.add(mesh0, step.longitude!, step.latitude!, 0, { properties: { name: "coucou :)" } });
    });
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#000"
      }}
    >
      <button onClick={addItem} className={"z-10 p-5 m-5 bottom-0 rounded-3xl bg-pink-100 absolute"}>Ajouter un item 3D</button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          zIndex: 1,
        }}
      />

      <Suspense fallback={null}>
        <HuntOverlay hunt={hunt} />
      </Suspense>

      <Toaster />

      {coords && (
        <div style={{
          position: "absolute", bottom: 16, left: 16,
          background: "rgba(0,0,0,0.6)", color: "#fff",
          padding: "8px 12px", borderRadius: 6,
          fontSize: 12, fontFamily: "monospace", lineHeight: 1.6,
        }}>
          <p className={'text-amber-100'}>POSITION ACTUELLE</p>
          <div>Lat : {coords.lat.toFixed(6)}</div>
          <div>Lon : {coords.long.toFixed(6)}</div>
          <div>distMoved : {coords.distMoved.toFixed(2)}</div>
          <div style={{ color: coords.accuracy <= 25 ? "#4ade80" : coords.accuracy <= 100 ? "#facc15" : "#f87171" }}>
            ±{Math.round(coords.accuracy)} m
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: "absolute", top: 16, left: 16,
          background: "rgba(200,0,0,0.8)", color: "#fff",
          padding: "8px 12px", borderRadius: 6, fontSize: 14,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}
