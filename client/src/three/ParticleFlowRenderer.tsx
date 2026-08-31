import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnalyticsStore } from '../store/useAnalyticsStore';
import { useReplayStore } from '../store/useReplayStore';
import { SCENE_DIMENSIONS, geoToWorld } from './utils/coordinates';

const PARTICLE_COUNT = 1500;

export const ParticleFlowRenderer: React.FC = () => {
  const { particleEnabled, verticalExaggeration, currentVectors } = useAnalyticsStore();
  const { replayMode, replayFrames, currentFrameIndex } = useReplayStore();
  const pointsRef = useRef<THREE.Points>(null);

  // Particle state arrays: positions, colors, and particle life ages
  const [positions, colors, ages, maxAges] = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const age = new Float32Array(PARTICLE_COUNT);
    const maxAge = new Float32Array(PARTICLE_COUNT);

    const halfW = SCENE_DIMENSIONS.width / 2;
    const halfD = SCENE_DIMENSIONS.depth / 2;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * SCENE_DIMENSIONS.width;
      pos[i * 3 + 1] = 0.55 * verticalExaggeration;
      pos[i * 3 + 2] = (Math.random() - 0.5) * SCENE_DIMENSIONS.depth;

      // Stagger particle ages for continuous smooth flow
      age[i] = Math.random() * 120;
      maxAge[i] = 80 + Math.random() * 100;

      // Glowing Cyan, Aquamarine, and Electric Blue
      const r = Math.random();
      if (r > 0.6) {
        col[i * 3] = 0.0;
        col[i * 3 + 1] = 0.95;
        col[i * 3 + 2] = 1.0;
      } else if (r > 0.3) {
        col[i * 3] = 0.1;
        col[i * 3 + 1] = 1.0;
        col[i * 3 + 2] = 0.8;
      } else {
        col[i * 3] = 0.35;
        col[i * 3 + 1] = 0.75;
        col[i * 3 + 2] = 1.0;
      }
    }

    return [pos, col, age, maxAge];
  }, [verticalExaggeration]);

  // Pre-calculate spatial vector nodes from real Copernicus API or Replay Frame
  const vectorLookup = useMemo(() => {
    const activeVectors = (replayMode && replayFrames.length > 0)
      ? (replayFrames[currentFrameIndex]?.vectors || [])
      : currentVectors;

    if (!activeVectors || activeVectors.length === 0) return null;
    return activeVectors.map(vec => {
      const [wx, wz] = geoToWorld(vec.latitude, vec.longitude);
      const rad = (vec.direction * Math.PI) / 180;
      const u = vec.u ?? (vec.speed * Math.sin(rad));
      const v = vec.v ?? (vec.speed * Math.cos(rad));
      return {
        x: wx,
        z: wz,
        u: (u || 0.35) * 0.05,
        v: (v || 0.15) * 0.05
      };
    });
  }, [currentVectors, replayMode, replayFrames, currentFrameIndex]);

  useFrame((state, delta) => {
    if (!particleEnabled || !pointsRef.current) return;

    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const posAttr = geom.attributes.position;
    const halfW = SCENE_DIMENSIONS.width / 2;
    const halfD = SCENE_DIMENSIONS.depth / 2;
    const speedScale = Math.min(delta * 60, 2);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      let x = posAttr.getX(i);
      let z = posAttr.getZ(i);

      ages[i] += 1;

      // Re-seed particle if it reached its lifetime or drifted outside scene bounds
      if (ages[i] > maxAges[i] || Math.abs(x) > halfW || Math.abs(z) > halfD) {
        ages[i] = 0;
        maxAges[i] = 80 + Math.random() * 100;
        x = (Math.random() - 0.5) * SCENE_DIMENSIONS.width;
        z = (Math.random() - 0.5) * SCENE_DIMENSIONS.depth;
        posAttr.setXYZ(i, x, 0.55 * verticalExaggeration, z);
        continue;
      }

      let u = 0.03;
      let v = 0.01;

      // Inverse Distance Weighted (IDW) smooth interpolation from Copernicus vector nodes
      if (vectorLookup && vectorLookup.length > 0) {
        let totalWeight = 0;
        let weightedU = 0;
        let weightedV = 0;

        for (let j = 0; j < vectorLookup.length; j++) {
          const node = vectorLookup[j];
          const dx = x - node.x;
          const dz = z - node.z;
          const distSq = dx * dx + dz * dz;

          // Influence radius
          if (distSq < 150) {
            const weight = 1 / (distSq + 1.2);
            weightedU += node.u * weight;
            weightedV += node.v * weight;
            totalWeight += weight;
          }
        }

        if (totalWeight > 0) {
          u = (weightedU / totalWeight) * speedScale;
          v = -(weightedV / totalWeight) * speedScale; // In Three.js: North is -z
        }
      }

      x += u;
      z += v;

      posAttr.setXYZ(i, x, 0.55 * verticalExaggeration, z);
    }

    posAttr.needsUpdate = true;
  });

  if (!particleEnabled) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.32}
        vertexColors
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
