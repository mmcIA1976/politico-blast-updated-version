# Politico Blast – Performance Notes

_Last updated: 2026-02-11_

## Baseline checklist
- [x] Repository cloned locally (deploy key, read-only)
- [x] Dependencies installed (`npm install`)
- [x] In-engine perf overlay available (Shift+P toggles `r3f-perf`)

## Measurement plan
1. **Startup / loading**
   - Measure time to first frame (TTFF) in dev and prod builds.
   - Capture JS bundle sizes via `vite build --analyze` and Chrome DevTools coverage.
2. **Gameplay baseline**
   - Use the new perf overlay (`Shift+P`) during regular gameplay, boss fights, and heavy particle moments.
   - Record FPS, frame time, draw-call count, geometries, textures.
3. **Subsystem profiling**
   - Player movement + useFrame logic.
   - Bullet / grenade spawning (currently React components per projectile).
   - Enemy controller + formations (check for per-frame allocations).
   - Debris / score popups (lifetime trimming).
4. **Asset loading**
   - Audit textures/models in `StreetProps`, `ScrollingBackground`, `PowerUps` for reuse and compression opportunities.

## Early observations (static review)
- **Player + input**: `useFrame` pulls `useArcadeGame.getState()` each frame and writes back to Zustand, which can trigger frequent store updates → React re-render pressure.
- **Bullets**: Each projectile is a React node backed by standard geometries → lots of draw calls; consider instancing / merged geometries + GPU attributes.
- **Enemies**: Heavy use of individual meshes with lights per enemy. Lighting cost spikes on levels with many specials; look into shared materials + instanced emissive mats. _Mitigations in progress:_ reduced simultaneous ground enemies by 20 % (wave size + max-per-level) to keep FPS stable while we build pooling/batching.
- **State arrays**: `updateBullets`, `updateGrenades`, `updateDebris`, etc., allocate new arrays every frame. Pooling or mutating buffers inside `useMemo` + `useRef` could lower GC.
- **LODs / culling**: Player boundary clamps exist, but background/props still render outside camera. Add distance-based visibility / simplified materials for far objects.

## Next steps
- Capture perf overlay screenshots in three scenarios (intro, crowd fight, boss).
- Profile React commit times using DevTools Profiler to confirm store churn impact.
- Prototype instanced bullets (e.g., `THREE.InstancedMesh` via r3f).
- Document recommended asset compression pipeline (Basis/BasisU, KTX2, sprite atlases).
