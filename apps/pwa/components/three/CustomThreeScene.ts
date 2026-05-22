import * as THREE from 'three';

export class CustomThreeScene extends THREE.Scene {
  constructor() {
    super();

    // Eclairage par défaut — sans ça, les matériaux PBR exportés par Unity (.glb) apparaissent noirs.
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    sun.position.set(1, 2, 1);
    this.add(ambient, sun);
  }
}
