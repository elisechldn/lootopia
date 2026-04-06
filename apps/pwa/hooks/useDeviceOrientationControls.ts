'use client'

import { useCallback } from 'react'
import * as LocAR from 'locar'
import type { ARRefs } from './arRefs'

type UseDeviceOrientationControlsOptions = {
  refs: React.MutableRefObject<ARRefs>
  onPermissionRequired: () => void
  onPermissionGranted: () => void
}

export type UseDeviceOrientationControlsReturn = {
  init: (signal: AbortSignal) => void
  destroy: () => void
  requestPermission: () => void
}

export function useDeviceOrientationControls({
  refs,
  onPermissionRequired,
  onPermissionGranted,
}: UseDeviceOrientationControlsOptions): UseDeviceOrientationControlsReturn {

  const init = useCallback((signal: AbortSignal): void => {

    const { camera } = refs.current
    if (!camera || signal.aborted) return

    const controls = new LocAR.DeviceOrientationControls(camera, {
      enablePermissionDialog: false,
      smoothingFactor: 0.85,
      orientationChangeThreshold: 0.02,
    })

    refs.current.controls = controls

    controls.on('deviceorientationerror', (e: { type?: string }) => {
      console.error("deviceorientationerror");
      if (e?.type === 'PERMISSION_REQUIRED') onPermissionRequired();
    })

    controls.on('deviceorientationgranted', (ev: { target: { connect: () => void } }) => {
      console.log("deviceorientationgranted");
      onPermissionGranted()
      ev.target.connect()
    })


    controls.init()
  }, [refs, onPermissionRequired, onPermissionGranted])

  const destroy = useCallback(() => {
    refs.current.controls?.dispose()
    refs.current.controls = null
  }, [refs])

  const requestPermission = useCallback(() => {
    refs.current.controls?.requestOrientationPermissions()
  }, [refs])

  return { init, destroy, requestPermission }
}