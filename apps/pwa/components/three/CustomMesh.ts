import * as THREE from 'three';

// Offsets relatifs à la position GPS de l'utilisateur (degrés)
// 0.0001° lat ≈ 11 m vers le nord — place l'objet juste devant la caméra
export const box = {
    mesh: new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({ color: 0xff0000 })),
    latOffset: 0.0001,  // ~11 m nord
    longOffset: 0,
    elev: 0
}