import type { CustomThreeRenderer } from '@/components/three/CustomThreeRenderer'
import type { CustomThreeScene } from '@/components/three/CustomThreeScene'
import type { CustomThreeCamera } from '@/components/three/CustomThreeCamera'
import type { CustomLocationBased } from '@/components/three/CustomLocationBased'
import type * as LocAR from 'locar'

export type DeviceOrientationControlsInstance = {
  requestOrientationPermissions: () => void
  update: () => void
  dispose: () => void
  init: () => void
  on: (event: string, handler: (e: any) => void) => void
}

export type ARRefs = {
  renderer: CustomThreeRenderer | null
  scene: CustomThreeScene | null
  camera: CustomThreeCamera | null
  locar: CustomLocationBased | null
  clickHandler: InstanceType<typeof LocAR.ClickHandler> | null
  controls: DeviceOrientationControlsInstance | null
}
