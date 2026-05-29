import * as THREE from 'three';

export class CustomThreeCamera extends THREE.PerspectiveCamera {
  constructor() {
    super(
      80,                                    // fov
      window.innerWidth / window.innerHeight, // aspect
      0.001,                                 // near
      500                                  // far
    )
  }

  onResize() {
    this.aspect = window.innerWidth / window.innerHeight;
    this.updateProjectionMatrix();
  }
}
