import * as THREE from 'three';

export class CustomThreeRenderer extends THREE.WebGLRenderer {

  constructor(canvas: HTMLCanvasElement) {
    super({ canvas, alpha: true })
    this.setClearColor(0x000000, 0)
    this.setPixelRatio(window.devicePixelRatio)
    this.setSize(window.innerWidth, window.innerHeight)
  }

  onResize() {
    this.setSize(window.innerWidth, window.innerHeight)
  }
}
