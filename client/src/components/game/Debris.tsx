import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useArcadeGame } from "@/lib/stores/useArcadeGame";

const MAX_DEBRIS_INSTANCES = 250;

export function Debris() {
  const debris = useArcadeGame((state) => state.debris.slice(-MAX_DEBRIS_INSTANCES));
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const count = Math.min(debris.length, MAX_DEBRIS_INSTANCES);
    for (let i = 0; i < count; i++) {
      const d = debris[i];
      dummy.position.set(d.position.x, d.position.y, d.position.z);
      dummy.scale.setScalar(d.size);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      color.set(d.color);
      mesh.setColorAt(i, color);
    }

    for (let i = count; i < MAX_DEBRIS_INSTANCES; i++) {
      dummy.position.set(0, -999, 0);
      dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set("#000"));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [color, debris, dummy]);

  return (
    <instancedMesh ref={meshRef} args={[undefined as any, undefined as any, MAX_DEBRIS_INSTANCES]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}
