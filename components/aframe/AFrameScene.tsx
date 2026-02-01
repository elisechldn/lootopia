"use client";

import "aframe";
import { useEffect, useState } from "react";

export default function AFrameScene() {
  const [arSupported, setArSupported] = useState<boolean | null>(null);

  const init = async () => {
    const canvas = document.createElement("canvas");
    document.body.appendChild(canvas);
    const gl = canvas.getContext("webgl", { xrCompatible: true });
    const session = await navigator.xr?.requestSession("immersive-ar");
    session?.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl),
    });
    const referenceSpace = await session.requestReferenceSpace("local");
  };

  useEffect(() => {
    console.log("navigator.xr --> : ", navigator.xr);
    navigator.xr?.requestSession("immersive-ar");

    if (globalThis.window === undefined || !("xr" in navigator)) {
      void Promise.resolve().then(() => setArSupported(false));
      return;
    }
    const xr = (navigator as Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean> } }).xr;
    xr?.isSessionSupported("immersive-ar")
      .then(setArSupported)
      .catch(() => setArSupported(false));
  }, []);

  return (
    <div className="relative h-full w-full">
      <a-scene
        embedded
        xr-mode-ui={"XRMode: ar; enterARButton: #myEnterARButton"}
        webxr="requiredFeatures: hit-test, local; optionalFeatures: dom-overlay"
        ar-hit-test="target: #placeable-sphere"
      >
        <a-sky color="lightgreen" hide-on-enter-ar />
        <a-entity id="placeable-sphere" visible="false">
          <a-sphere radius="0.2" color="#4CC3D9" />
        </a-entity>
        <a-camera look-controls />
        {arSupported !== false && (
          <button type="button" id="myEnterARButton">
            Entrer en AR
          </button>
        )}
      </a-scene>
      {arSupported === false && (
        <div
          className="absolute bottom-6 left-1/2 z-10 max-w-sm -translate-x-1/2 rounded-lg bg-neutral-800 px-4 py-3 text-center text-sm text-white shadow-lg"
          role="alert"
        >
          La réalité augmentée n&apos;est pas prise en charge sur ce navigateur ou cet appareil. Utilisez{" "}
          <strong>Chrome sur Android</strong> (page en HTTPS) pour tester l&apos;AR.
        </div>
      )}
    </div>
  );
}
