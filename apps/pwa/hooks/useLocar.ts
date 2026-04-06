'use client'

import { useCallback } from 'react'
import * as LocAR from 'locar'
import type { ARRefs } from './arRefs'
import { CustomLocationBased } from '@/components/three/CustomLocationBased'
import { useARStore } from '@/store/arStore'

type UseLocarOptions = {
  refs: React.MutableRefObject<ARRefs>
  onError: (msg: string) => void
}

export type UseLocarReturn = {
  init: (signal: AbortSignal) => Promise<void>
  destroy: () => void
}

export function useLocar({ refs, onError }: UseLocarOptions): UseLocarReturn {
  const setCoords = useARStore((s) => s.setCoords)

  const init = useCallback(async (signal: AbortSignal): Promise<void> => {
    const { scene, camera, renderer } = refs.current
    if (!scene || !camera || !renderer || signal.aborted) return

    const locar = new CustomLocationBased(scene, camera)
    const clickHandler = new LocAR.ClickHandler(renderer)

    refs.current.locar = locar
    refs.current.clickHandler = clickHandler

    locar.setupGpsListeners({
      onError,
      onCoordsUpdate: (coords) => setCoords(coords),
    })

    await locar.startGps();

    if (signal.aborted) {
      locar.stopGps()
      refs.current.locar = null
      refs.current.clickHandler = null
    }
  }, [refs, onError, setCoords])

  const destroy = useCallback(() => {
    refs.current.locar?.stopGps()
    refs.current.locar = null
    refs.current.clickHandler = null
  }, [refs])

  return { init, destroy }
}
