"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { useARScene } from "../../hooks/useARScene";
import { useARStore } from "@/store/arStore";
import { useUserStore } from "@/store/userStore";
import type { HuntGetPayload, SingleResult } from "@repo/types";
import { HuntOverlay } from "@/components/ar/HuntOverlay";
import Toaster from "@/components/ui/Toaster";
import { validateStep } from "@/services/participation.service";
import { assetUrl } from "@/lib/assets";

function tagWithProperties(object: THREE.Object3D, properties: { name: string }) {
  object.traverse((child) => {
    (child as unknown as { properties: { name: string } }).properties = properties;
  });
}

function buildPlaceholderMesh(): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ff00 }),
  );
}

// LocAR.ClickHandler.raycast() utilise intersectObjects(scene.children, false) — non-récursif.
// Un gltf.scene (Group sans géométrie) n'est donc jamais touché. On l'enveloppe dans un Mesh
// invisible englobant qui sert de hit-target raycastable au niveau de scene.children.
function wrapWithHitTarget(object: THREE.Object3D): THREE.Mesh {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  console.log(`Largeur: ${size.x}, Hauteur: ${size.y}, Profondeur: ${size.z}`);
  const hit = new THREE.Mesh(
    new THREE.BoxGeometry(
      Math.max(size.x, 0.1),
      Math.max(size.y, 0.1),
      Math.max(size.z, 0.1),
    ),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  // Recentre le contenu pour qu'il s'aligne avec la hitbox centrée à l'origine.
  object.position.sub(center);
  hit.add(object);
  return hit;
}

type StepWithCoords = HuntGetPayload<{ include: { steps: true }; }>['steps'][number] & {
  latitude?: number | null;
  longitude?: number | null;
  arItem?: { id: string; filepath: string; filename: string; hasAnimations: boolean } | null;
};

type HuntWithSteps = Omit<HuntGetPayload<{ include: { steps: true } }>, 'steps'> & {
  steps: StepWithCoords[];
};

type Props = {
  hunt: Promise<SingleResult<HuntWithSteps>>;
  huntId?: number;
  participationId?: number;
  stepId?: number;
};

export default function ARScene({ hunt, huntId, participationId, stepId }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mixerRef = useRef<THREE.AnimationMixer>(null);
  const coords = useARStore((s) => s.coords);
  const user = useUserStore((s) => s.user);
  const validatingRef = useRef(false);
  const [huntCompleted, setHuntCompleted] = useState(false);
  const [huntTitle, setHuntTitle] = useState('');
  const [totalPoints, setTotalPoints] = useState(0);

  const getFreshCoords = useCallback((): Promise<{ lat: number; long: number }> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, long: pos.coords.longitude }),
        () => resolve({ lat: coords?.lat ?? 0, long: coords?.long ?? 0 }),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    });
  }, [coords]);

  const handleItemHit = useCallback(async () => {
    if (!participationId || !stepId || !user || validatingRef.current) return;
    validatingRef.current = true;

    try {
      const { lat, long } = await getFreshCoords();

      const result = await validateStep(
        participationId,
        stepId,
        user.id,
        lat,
        long,
      ) as { status?: string; totalPoints?: number };

      if (result?.status === 'COMPLETED') {
        setTotalPoints(result.totalPoints ?? 0);
        setHuntCompleted(true);
      } else {
        // Next step — back to map
        router.replace(`/hunts/${huntId}/game/map?participationId=${participationId}`);
      }
    } catch (err) {
      console.error('validateStep failed:', err);
      validatingRef.current = false;
    }
  }, [participationId, stepId, user, getFreshCoords, huntId, router]);

  const { error, refs, requestOrientation } = useARScene({
    canvasRef,
    videoRef,
    onItemHit: handleItemHit,
    mixerRef
  });

  const { locar, scene, camera } = refs.current;

  // Add only the current step's AR item
  useEffect(() => {
    if (!locar || !scene || !camera) return;

    let cancelled = false;
    let addedObject: THREE.Object3D | null = null;

    hunt.then(async (data) => {
      if (cancelled) return;
      setHuntTitle(data.data.title);

      const steps = data.data.steps;
      if (!steps) return;
      const targetStep = stepId
        ? steps.find((s) => s.id === stepId)
        : steps[0];

      if (!targetStep || targetStep.longitude == null || targetStep.latitude == null) return;

      const properties = { name: targetStep.title };
      let object3d: THREE.Object3D;
      const glbUrl = targetStep.arItem?.filepath ? assetUrl(targetStep.arItem.filepath) : null;
      console.log("glbUrl => ", glbUrl);
      if (glbUrl) {
        try {
          const gltf = await new GLTFLoader().loadAsync(glbUrl);

          const mixer = new THREE.AnimationMixer(gltf.scene);
          mixerRef.current = mixer;
          console.log("gltf ==> ", gltf);
          if (gltf.animations.length > 0) {
            gltf.animations.forEach(animationClip => {
              mixer.clipAction(animationClip).play();
            })
          }

          // Normalization of scale: ensure all objects are roughly the same size (~1 meter)
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const size = box.getSize(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 1 / maxDim : 1;
          gltf.scene.scale.multiplyScalar(scale);

          // Y-alignment: position the base of the object at Y=0
          const alignedBox = new THREE.Box3().setFromObject(gltf.scene);
          gltf.scene.position.y = -alignedBox.min.y;

          object3d = wrapWithHitTarget(gltf.scene);
        } catch (err) {
          console.error("[AR] Failed to load .glb, falling back to placeholder:", err);
          object3d = buildPlaceholderMesh();
        }
      } else {
        object3d = buildPlaceholderMesh();
      }

      if (cancelled) return;
      tagWithProperties(object3d, properties);
      addedObject = object3d;
      locar.add(object3d, targetStep.longitude, targetStep.latitude, 0, properties);
    });

    return () => {
      cancelled = true;
      mixerRef.current = null;
      if (addedObject && scene) {
        scene.remove(addedObject);
      }
    };
  }, [hunt, locar, scene, camera, stepId]);

  return (
    <div style={{ position: "relative", width: "100dvw", height: "100dvh", overflow: "hidden", background: "#000" }}>
      {/*<button*/}
      {/*  className="z-10 p-5 m-5 top-16 right-5 rounded-3xl bg-red-500 absolute"*/}
      {/*  onClick={requestOrientation}*/}
      {/*>*/}
      {/*  Autoriser la boussole*/}
      {/*</button>*/}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
      />

      <canvas
        ref={canvasRef}
        style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
      />

      <Suspense fallback={null}>
        <HuntOverlay hunt={hunt} stepId={stepId} />
      </Suspense>

      <Toaster />

      {coords && (
        <div style={{ position: "absolute", bottom: 16, left: 16, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 12, fontFamily: "monospace", lineHeight: 1.6 }}>
          <p className="text-amber-100">POSITION ACTUELLE</p>
          <div>Lat : {coords.lat.toFixed(6)}</div>
          <div>Lon : {coords.long.toFixed(6)}</div>
          <div style={{ color: coords.accuracy <= 25 ? "#4ade80" : coords.accuracy <= 100 ? "#facc15" : "#f87171" }}>
            ±{Math.round(coords.accuracy)} m
          </div>
        </div>
      )}

      {error && (
        <div style={{ position: "absolute", top: 16, left: 16, background: "rgba(200,0,0,0.8)", color: "#fff", padding: "8px 12px", borderRadius: 6, fontSize: 14 }}>
          {error}
        </div>
      )}

      {/* Congratulations modal */}
      {huntCompleted && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 px-8 text-center">
          <div className="rounded-2xl bg-background p-8 shadow-xl flex flex-col items-center gap-4 w-full max-w-sm">
            <Trophy size={56} className="text-amber-500" />
            <h1 className="text-2xl font-bold">Félicitations !</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vous avez terminé{' '}
              <span className="font-semibold text-foreground">{huntTitle}</span>
              {totalPoints > 0 && (
                <> avec <span className="font-semibold text-foreground">{totalPoints} points</span></>
              )}.
            </p>
            <button
              onClick={() => router.replace('/profile')}
              className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Voir mon profil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
