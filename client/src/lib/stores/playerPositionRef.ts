import * as THREE from "three";

export const playerWorldPosition = new THREE.Vector3(0, 0.5, 0);
export const playerWorldDirection = new THREE.Vector3(0, 0, 1);

export function updatePlayerWorldPosition(x: number, y: number, z: number) {
  playerWorldPosition.set(x, y, z);
}

export function updatePlayerWorldDirection(x: number, y: number, z: number) {
  playerWorldDirection.set(x, y, z);
}
