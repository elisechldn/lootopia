'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ARRefs } from './arRefs'
import { useThreeSetup } from './useThreeSetup'
import { useLocar } from './useLocar'
import { useDeviceOrientationControls } from './useDeviceOrientationControls'
import { toast } from 'sonner'
import * as THREE                                   from "three";

type UseARSceneOptions = {
  canvasRef: RefObject<HTMLCanvasElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  onItemHit?: (name: string) => void
  mixerRef: RefObject<THREE.AnimationMixer | null>
}

export type UseARSceneReturn = {
  needsOrientationPermission: boolean
  error: string | null
  requestOrientation: () => void
  refs: RefObject<ARRefs>
}

export function useARScene({ canvasRef, videoRef, onItemHit, mixerRef }: UseARSceneOptions): UseARSceneReturn {
  const [needsOrientationPermission, setNeedsOrientationPermission] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const onItemHitRef = useRef(onItemHit)
  const timerRef = useRef(new THREE.Timer());

  const refs = useRef<ARRefs>({
    renderer: null,
    scene: null,
    camera: null,
    locar: null,
    clickHandler: null,
    controls: null,
  })

  // Hooks use
  const threeSetup = useThreeSetup({ canvasRef, videoRef, refs })
  const locar = useLocar({
    refs,
    onError: useCallback((msg: string) => setError(msg), []),
  })
  const orientationControls = useDeviceOrientationControls({
    refs,
    onPermissionRequired: useCallback(() => setNeedsOrientationPermission(true), []),
    onPermissionGranted: useCallback(() => setNeedsOrientationPermission(false), []),
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const controller = new AbortController()
    const { signal } = controller
    const refsSnapshot = refs.current

    ;(async () => {
      console.log('[AR] stage 1 start')
      // Stage 1 : Three.js objects + flux caméra
      try {
        await threeSetup.init(signal)
      } catch (e) {
        setError(`Erreur caméra : ${e instanceof Error ? e.message : String(e)}`)
        return
      }
      console.log('[AR] stage 1 done — aborted:', signal.aborted)
      if (signal.aborted) return

      console.log('[AR] stage 2 start')
      // Stage 2 : GPS / LoCAR (dépend de scene + camera + renderer du stage 1)
      await locar.init(signal)
      console.log('[AR] stage 2 done — aborted:', signal.aborted)
      if (signal.aborted) return

      console.log('[AR] stage 3 start')
      // Stage 3 : Device orientation controls (dépend de camera du stage 1)
      orientationControls.init(signal)
      console.log('[AR] stage 3 done — aborted:', signal.aborted)
      if (signal.aborted) return

      // Stage 4 : Boucle de rendu — orchestrateur uniquement
      const { renderer, scene, camera, controls, clickHandler } = refsSnapshot
      console.log('[AR] stage 4 refs:', { renderer: !!renderer, scene: !!scene, camera: !!camera, controls: !!controls, clickHandler: !!clickHandler })
      if (!renderer || !scene || !camera || !controls || !clickHandler) return

      renderer.setAnimationLoop((timestamp) => {
        controls.update()
        // console.log("camera.quaternion -> ", camera.quaternion);
        console.log("setAnimationLoop")
        const intersects = clickHandler.raycast(camera, scene)
        const first = intersects[0]
        if (first) {
          const obj = first.object as unknown as { properties: { name: string } }
          if (obj.properties?.name) {
            toast(obj.properties.name)
            onItemHitRef.current?.(obj.properties.name)
          }
        }

        // Animation
        const timer = timerRef.current;
        timer.update(timestamp);
        const delta = timer.getDelta();
        if (mixerRef?.current) {
          mixerRef.current.update(delta);
        }

        renderer.render(scene, camera)
      })
    })()

    return () => {
      controller.abort()
      // Stopper la boucle avant tout dispose — elle lit renderer/controls/scene
      refsSnapshot.renderer?.setAnimationLoop(null)
      // Destruction dans l'ordre inverse de l'initialisation
      orientationControls.destroy()
      locar.destroy()
      threeSetup.destroy()
    }
  }, [canvasRef, videoRef]) // eslint-disable-line react-hooks/exhaustive-deps
  // threeSetup/locar/orientationControls sont stables (useCallback []) —
  // les inclure causerait des re-runs parasites.

  const requestOrientation = useCallback(() => {
    orientationControls.requestPermission()
  }, [orientationControls])

  return {
    needsOrientationPermission,
    error,
    requestOrientation,
    refs,
  }
}
