"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface GlbPreviewProps {
  src: string | null;
}

export default function GlbPreview({ src }: GlbPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (!src || !containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const controller = new AbortController();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.01, 1000);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);

    scene.add(new THREE.AmbientLight(0xffffff, 1));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let model: THREE.Object3D | null = null;

    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        if (controller.signal.aborted) return;

        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        model.position.sub(center);

        const maxDimension = Math.max(size.x, size.y, size.z) || 1;
        const distance = maxDimension * 1.8;
        camera.position.set(distance, distance, distance);
        camera.near = maxDimension / 100;
        camera.far = maxDimension * 100;
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.update();

        scene.add(model);
      },
      undefined,
      () => {
        if (!controller.signal.aborted) setError("Impossible de charger le modèle");
      }
    );

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      controller.abort();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      renderer.dispose();
      if (model) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            for (const material of materials) {
              material.dispose();
            }
          }
        });
      }
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className="h-64 rounded-xl border border-border bg-muted overflow-hidden flex items-center justify-center"
    >
      {!src && (
        <p className="text-sm text-muted-foreground/70">Aucun aperçu disponible</p>
      )}
      {src && error && (
        <p className="text-sm text-red-500 px-4 text-center">{error}</p>
      )}
      <canvas ref={canvasRef} className={`w-full h-full ${!src || error ? "hidden" : ""}`} />
    </div>
  );
}
