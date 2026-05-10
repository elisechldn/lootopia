'use client'

import { useCallback, useRef } from 'react'
import type { ARRefs } from './arRefs'
import { CustomThreeRenderer } from '@/components/three/CustomThreeRenderer'
import { CustomThreeScene } from '@/components/three/CustomThreeScene'
import { CustomThreeCamera } from '@/components/three/CustomThreeCamera'

type UseThreeSetupOptions = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  videoRef: React.RefObject<HTMLVideoElement | null>
  refs: React.MutableRefObject<ARRefs>
}

export type UseThreeSetupReturn = {
  init: (signal: AbortSignal) => Promise<void>
  destroy: () => void
}

export function useThreeSetup({ canvasRef, videoRef, refs }: UseThreeSetupOptions): UseThreeSetupReturn {
  const streamRef = useRef<MediaStream | null>(null)
  const onResizeRef = useRef<(() => void) | null>(null)

  const init = useCallback(async (signal: AbortSignal): Promise<void> => {
    const canvas = canvasRef.current
    if (!canvas || signal.aborted) return

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    })

    if (signal.aborted) {
      stream.getTracks().forEach(t => t.stop())
      return
    }

    streamRef.current = stream
    if (videoRef.current) videoRef.current.srcObject = stream

    refs.current.renderer = new CustomThreeRenderer(canvas)
    refs.current.scene = new CustomThreeScene()
    refs.current.camera = new CustomThreeCamera()

    const onResize = () => {
      refs.current.camera?.onResize()
      refs.current.renderer?.onResize()
    }
    onResizeRef.current = onResize
    window.addEventListener('resize', onResize)
  }, [canvasRef, videoRef, refs])

  const destroy = useCallback(() => {
    if (onResizeRef.current) {
      window.removeEventListener('resize', onResizeRef.current)
      onResizeRef.current = null
    }
    refs.current.renderer?.dispose()
    refs.current.renderer = null
    refs.current.scene = null
    refs.current.camera = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    streamRef.current = null
  }, [refs, videoRef])

  return { init, destroy }
}
