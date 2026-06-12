"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  ArToolkitSource,
  ArToolkitContext,
  ArMarkerControls,
  // @ts-expect-error AR.js ships no TypeScript types
} from "@ar-js-org/ar.js/three.js/build/ar-threex.mjs";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
} from "three";
import { assetUrl } from "@/lib/assets";

export interface MarkerArTesterProps {
  /** Chemin relatif du fichier .patt (ex: "partners/12/ar-markers/34/xxx.patt") */
  patternUrl: string;
  /** Chemin relatif du fichier .glb de l'item AR (ex: "partners/12/ar-items/xxx.glb") */
  glbFilepath?: string | null;
}

// Taille du modèle .glb relative à la taille du marqueur (1 = même largeur que le marqueur)
const MODEL_SCALE = 0.5;

function buildPlaceholderMesh() {
  return new Mesh(
    new BoxGeometry(0.5, 0.5, 0.5),
    new MeshStandardMaterial({ color: 0x00ff88 }),
  );
}

// AR.js classes have no TypeScript types — typed as unknown at call sites
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function MarkerArTester({ patternUrl, glbFilepath }: MarkerArTesterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [markerVisible, setMarkerVisible] = useState(false);

  // desactiver le scroll
  const prevOverflow = document.body.style.overflow;
  const prevOverscroll = document.documentElement.style.overscrollBehavior;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overscrollBehavior = "none";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let onResize: (() => void) | null = null;

    const init = async () => {
      // RENDERER
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = "absolute";
      renderer.domElement.style.top = "0px";
      renderer.domElement.style.left = "0px";
      renderer.domElement.style.zIndex = "16";
      container.appendChild(renderer.domElement);

      // SCENE
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      scene.add(camera);
      scene.add(new AmbientLight(0xffffff, 0.8));
      const dirLight = new DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(1, 2, 1);
      scene.add(dirLight);

      // Lire dimensions réelles du capteur caméra
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { aspectRatio: window.innerWidth / window.innerHeight },
      });
      const track = stream.getVideoTracks()[0];
      const settings = track?.getSettings() ?? {};
      const camW = settings.width;
      const camH = settings.height;
      stream.getTracks().forEach((t) => t.stop()); // libère caméra, ArToolkit la reprend après

      // AR.js source (webcam)
      const arToolkitSource: any = new ArToolkitSource({
        sourceType: "webcam",
        displayWidth: window.innerWidth,
        displayHeight: window.innerHeight,
      });

      // AR.js context
      const arToolkitContext: typeof ArToolkitContext = new ArToolkitContext({
        cameraParametersUrl: "/camera_para.dat",
        detectionMode: "mono",
        canvasWidth: camW,
        canvasHeight: camH,
        debug: false,
      });

      arToolkitContext.init(() => {
        console.assert = () => {}; // workaround to avoid bug into getProjectionMatrix()
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
      });

      arToolkitSource.init(
        () => {
          const video: HTMLVideoElement = arToolkitSource.domElement;
          video.addEventListener("canplay", () => onResize?.());
          video.setAttribute("data-app", "video");
          setLoading(false);
        },
        () => {
          setCameraError("Impossible d'accéder à la caméra");
          setLoading(false);
        },
      );

      // Marker root — position/rotation tracked by ArMarkerControls
      const markerRoot = new THREE.Group();
      scene.add(markerRoot);
      const resolvedPatternUrl = "/assets/" + patternUrl;

      new ArMarkerControls(arToolkitContext, markerRoot, {
        type: "pattern",
        patternUrl: resolvedPatternUrl,
      });

      // Charge le .glb de l'item AR, fallback sur le cube placeholder
      const clock = new THREE.Clock();
      let mixer: THREE.AnimationMixer | null = null;
      const glbUrl = glbFilepath ? assetUrl(glbFilepath) : null;
      if (glbUrl) {
        try {
          const gltf = await new GLTFLoader().loadAsync(glbUrl);
          mixer = new THREE.AnimationMixer(gltf.scene);
          if (gltf.animations.length > 0) {
            gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
          }
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          gltf.scene.scale.multiplyScalar(maxDim > 0 ? MODEL_SCALE / maxDim : MODEL_SCALE);
          const alignedBox = new THREE.Box3().setFromObject(gltf.scene);
          gltf.scene.position.y = -alignedBox.min.y;
          markerRoot.add(gltf.scene);
        } catch (err) {
          console.error("[AR] Failed to load .glb, falling back to placeholder:", err);
          markerRoot.add(buildPlaceholderMesh());
        }
      } else {
        markerRoot.add(buildPlaceholderMesh());
      }

      onResize = function () {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer?.domElement);

        if (arToolkitContext.arController !== null) {
          const canvas = arToolkitContext.arController.canvas;
          arToolkitSource.copyElementSizeTo(canvas);
          canvas.setAttribute("data-app", "canvas context");
          const video = arToolkitSource.domElement;
          video.style.margin = "0px";
          video.style.width = window.innerWidth;
          video.style.height = window.innerHeight;
          video.style.objectFit = "cover";
          video.style.zIndex = 15;
          canvas.style.opacity = 0.4;
          canvas.style.width = video.style.width;
          canvas.style.height = video.style.height;
          canvas.style.margin = "0px";
          canvas.style.zIndex = 15;
        }
      };

      window.addEventListener("resize", onResize);

      // Animation loop
      function animate() {
        animId = requestAnimationFrame(animate);
        if (arToolkitSource.ready && arToolkitContext.arController !== null) {
          arToolkitContext.update(arToolkitSource.domElement);
          setMarkerVisible(markerRoot.visible);
        }
        if (mixer) mixer.update(clock.getDelta());
        renderer!.render(scene, camera);
      }
      animate();
    };

    init().catch(() => {
      setCameraError("Erreur d'initialisation AR");
      setLoading(false);
    });

    return () => {
      cancelAnimationFrame(animId);
      const rendererEl = renderer?.domElement;
      renderer?.dispose();
      renderer?.forceContextLoss();
      if (rendererEl && container.contains(rendererEl)) {
        container.removeChild(rendererEl);
      }
      if (onResize) window.removeEventListener("resize", onResize);
      document.querySelectorAll("video").forEach((v) => v.remove());
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overscrollBehavior = prevOverscroll;
    };
  }, [patternUrl, glbFilepath]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100dvw",
        height: "100dvh",
        overflow: "hidden",
        background: "#000",
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            color: "#fff",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p style={{ fontSize: 14 }}>Initialisation de la caméra AR…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {cameraError && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "0 24px",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          {cameraError}
        </div>
      )}

      {!loading && !cameraError && (
        <div
          style={{
            position: "absolute",
            top: "calc(env(safe-area-inset-top, 0px) + 12px)",
            left: 0,
            right: 0,
            zIndex: 20,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              background: markerVisible
                ? "rgba(34, 197, 94, 0.85)"
                : "rgba(0, 0, 0, 0.55)",
              transition: "background-color 0.2s ease",
            }}
          >
            {markerVisible ? "Marqueur détecté ✅" : "Recherche du marqueur…"}
          </span>
        </div>
      )}
    </div>
  );
}
