"use client";

import { useEffect, useRef, useState }                         from "react";
import * as THREE                                              from "three";
import { GLTFLoader }                                          from "three/addons/loaders/GLTFLoader.js";
import { assetUrl }                                            from "@/lib/assets";
import {
  ArToolkitSource,
  ArToolkitContext,
  ArMarkerControls,
// @ts-ignore
} from "@ar-js-org/ar.js/three.js/build/ar-threex.mjs";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
} from "three";

export interface ARCameraProps {
  patternUrl: string;
  glbFilepath?: string | null;
  participationId?: number;
  stepId?: number;
  userId?: number;
  onItemHit?: (lat: number, lon: number) => void;
  isValidating?: boolean;
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

export default function ARCamera({ patternUrl, glbFilepath, participationId, stepId, userId, onItemHit, isValidating }: ARCameraProps) {

  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const onItemHitRef = useRef(onItemHit);
  const isValidatingRef = useRef(isValidating);
  const pendingRef = useRef(false);

  useEffect(() => { onItemHitRef.current = onItemHit; }, [onItemHit]);
  useEffect(() => {
    isValidatingRef.current = isValidating;
    if (!isValidating) pendingRef.current = false;
  }, [isValidating]);
  useEffect(() => {
    if (!containerRef.current) return;

    let animId = 0;
    let renderer: THREE.WebGLRenderer | null = null;

    // onResize needs to be accessible in the cleanup closure
    let onResize: (() => void) | null = null;

    async function init() {

      // RENDERER
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0px';
      renderer.domElement.style.left = '0px';
      renderer.domElement.style.zIndex = '16';
      containerRef.current?.appendChild(renderer.domElement);

      // SCENE
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera();
      scene.add(camera);
      scene.add(new AmbientLight(0xffffff, 0.8));
      const dirLight = new DirectionalLight(0xffffff, 0.5);
      dirLight.position.set(1, 2, 1);
      scene.add(dirLight);

      // Lire dimensions réelles du capteur caméra
      const stream = await navigator.mediaDevices.getUserMedia({ video: {
          aspectRatio: window.innerWidth / window.innerHeight,
        }});
      const track = stream.getVideoTracks()[0];
      console.log("stream.getVideoTracks()", stream.getVideoTracks())
      const { width: camW, height: camH } = track?.getSettings()!;
      console.log("track?.getSettings()", track?.getSettings())
      stream.getTracks().forEach(t => t.stop()); // libère caméra, ArToolkit la reprend après

      // Capteur retourne toujours landscape (ex: 640×480) même sur mobile portrait.
      // On swap si l'écran est portrait pour que le ratio source corresponde à l'affichage.
      const isPortrait = window.innerHeight > window.innerWidth;
      const sourceWidth  = isPortrait ? Math.min(camW!, camH!) : Math.max(camW!, camH!);
      const sourceHeight = isPortrait ? Math.max(camW!, camH!) : Math.min(camW!, camH!);
      // console.log(`sourceWidth: ${sourceWidth}, sourceHeight: ${sourceHeight}`);

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

      arToolkitSource.init(() => {
          const video: HTMLVideoElement = arToolkitSource.domElement;
          video.addEventListener('canplay', onResize);
          video.setAttribute('data-app', 'video');
          // containerRef.current?.insertBefore(video, renderer!.domElement);
          // onResize();
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
      const resolvedPatternUrl = '/assets/' + patternUrl;
      console.log("patternUrl", patternUrl)
      console.log("patternUrl resolved", resolvedPatternUrl)

      new ArMarkerControls(arToolkitContext, markerRoot, {
        type: "pattern",
        patternUrl: resolvedPatternUrl,
      });

      // Load .glb from step's arItem, fallback to placeholder
      const clock = new THREE.Clock();
      let mixer: THREE.AnimationMixer | null = null;
      const glbUrl = glbFilepath ? assetUrl(glbFilepath) : null;
      console.log("glbFilepath", glbFilepath)
      console.log("assetUrl(glbFilepath)", assetUrl(glbFilepath))
      if (glbUrl) {
        console.log("COUCOU", glbUrl)
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


      // Raycaster for tap/click → GPS check → validateStep
      const raycaster = new THREE.Raycaster();
      function handleTap(e: MouseEvent | TouchEvent) {

        const rect = renderer!.domElement.getBoundingClientRect();
        const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
        const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
        const x = ((clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
        const hits = raycaster.intersectObjects(scene.children, true);
        console.log("HITS", hits)
        if (hits.length === 0 || !markerRoot.visible) return;

        if (!navigator.geolocation) {
          setCameraError("La géolocalisation est requise pour valider cette étape");
          return;
        }

        if (isValidatingRef.current || pendingRef.current) return;
        pendingRef.current = true;

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            onItemHitRef.current?.(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            setCameraError("Impossible d'obtenir votre position GPS");
          },
          { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
        );
      }

      renderer.domElement.addEventListener("click", handleTap);
      renderer.domElement.addEventListener("touchend", handleTap);


      function onResize() {
        arToolkitSource.onResizeElement();
        arToolkitSource.copyElementSizeTo(renderer?.domElement);

        const w = window.innerWidth;
        const h = window.innerHeight;
        console.log('RESIZE WINDOW --> width:', w, 'height:', h);

        if (arToolkitContext.arController !== null) {
          const canvas = arToolkitContext.arController.canvas;
          arToolkitSource.copyElementSizeTo(canvas);
          canvas.setAttribute('data-app', 'canvas context');
          const video = arToolkitSource.domElement;
          video.style.margin = '0px';
          video.style.width = window.innerWidth;
          video.style.height = window.innerHeight;
          video.style.objectFit = 'cover';
          video.style.zIndex = 15;
          canvas.style.opacity = 0.4;
          canvas.style.width = video.style.width;
          canvas.style.height = video.style.height;
          canvas.style.margin = '0px';
          canvas.style.zIndex = 15;


          console.log("RESIZE VIDEO --> width:", video.style.width, "height:", video.style.height);
        }
      }

      window.addEventListener("resize", onResize);

      // Animation loop
      function animate() {
        animId = requestAnimationFrame(animate);
        if (arToolkitSource.ready && arToolkitContext.arController !== null) {
          arToolkitContext.update(arToolkitSource.domElement);
          if (markerRoot.visible) {
            console.log("Marqueur détecté", markerRoot.position);
          }
        }
        if (mixer) mixer.update(clock.getDelta());
        // scene.visible mirrors marker detection state
        scene.visible = camera.visible;
        renderer!.render(scene, camera);
      }
      animate();
    }

    init().catch(() => {
      setCameraError("Erreur d'initialisation AR");
      setLoading(false);
    });

    return () => {
      cancelAnimationFrame(animId);
      renderer?.dispose();
      renderer?.forceContextLoss();
      if (containerRef.current?.contains(renderer!.domElement)) {
        containerRef.current.removeChild(renderer!.domElement);
      }
      if (onResize) window.removeEventListener("resize", onResize);
      document.querySelectorAll('video').forEach(v => v.remove());
    };

  }, []);

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
            zIndex: 10,
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
            zIndex: 10,
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

    </div>
  );
}
