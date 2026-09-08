import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { useObservationStore } from '../store/useObservationStore';
import { useOceanStore } from '../store/useOceanStore';
import { useReplayStore } from '../store/useReplayStore';
import { ArgoRenderer } from './ArgoRenderer';
import { GliderRenderer } from './GliderRenderer';
import { CTDRenderer } from './CTDRenderer';
import { MooringRenderer } from './MooringRenderer';
import { BGCRenderer } from './BGCRenderer';
import { geoToWorld, depthToWorld } from './utils/coordinates';
import type { ArgoFloat, Glider, CTDObservation, BGCObservation, Mooring } from '../../../shared/types';

export const ObservationSystem: React.FC = () => {
  const { observations, showArgo, showGliders, showCTD, showMoorings, showBGC } = useObservationStore();
  const { replayMode, currentFrameIndex, instrumentSnapshots, replayFrames } = useReplayStore();

  // Calculate snapshot-driven historical positions and visibility during Replay
  const { dynamicArgos, argoTrails, dynamicGliders, visibleCTDs, visibleBGCs } = useMemo(() => {
    const rawArgos = observations.filter(o => o.type === 'argo') as ArgoFloat[];
    const rawGliders = observations.filter(o => o.type === 'glider') as Glider[];
    const rawCTDs = observations.filter(o => o.type === 'ctd') as CTDObservation[];
    const rawBGCs = observations.filter(o => o.type === 'bgc') as BGCObservation[];

    if (!replayMode || !instrumentSnapshots || instrumentSnapshots.length === 0) {
      return {
        dynamicArgos: rawArgos,
        argoTrails: [],
        dynamicGliders: rawGliders,
        visibleCTDs: rawCTDs,
        visibleBGCs: rawBGCs
      };
    }

    const currentSnapshot = instrumentSnapshots[currentFrameIndex];
    if (!currentSnapshot) {
      return {
        dynamicArgos: rawArgos,
        argoTrails: [],
        dynamicGliders: rawGliders,
        visibleCTDs: rawCTDs,
        visibleBGCs: rawBGCs
      };
    }

    const frameTime = new Date(currentSnapshot.timestamp).getTime();

    // 1. Argo Floats: Render from historical ERDDAP snapshot data
    let snapshotArgos: ArgoFloat[] = [];
    if (currentSnapshot.argos && currentSnapshot.argos.length > 0) {
      snapshotArgos = currentSnapshot.argos.map((a, idx) => ({
        id: `replay-argo-${a.wmoId}`,
        type: 'argo' as const,
        wmoId: a.wmoId,
        cycleNumber: 1,
        latitude: a.latitude,
        longitude: a.longitude,
        depth: a.depth,
        timestamp: currentSnapshot.timestamp,
        variables: {
          temperature: a.temperature,
          salinity: a.salinity,
          pressure: a.depth
        },
        status: 'Active'
      }));
    } else {
      snapshotArgos = rawArgos;
    }

    // 2. Argo Trajectory Trails: Connect coordinates across historical snapshots up to currentFrameIndex
    const trailPointsByWmo = new Map<string, THREE.Vector3[]>();
    const viewBounds = useOceanStore.getState().viewBounds;
    for (let i = 0; i <= currentFrameIndex; i++) {
      const snap = instrumentSnapshots[i];
      if (!snap || !snap.argos) continue;
      snap.argos.forEach(a => {
        if (!trailPointsByWmo.has(a.wmoId)) trailPointsByWmo.set(a.wmoId, []);
        const [tx, tz] = geoToWorld(a.latitude, a.longitude, viewBounds);
        trailPointsByWmo.get(a.wmoId)!.push(new THREE.Vector3(tx, 0.4, tz));
      });
    }

    const trails = Array.from(trailPointsByWmo.entries())
      .filter(([_, pts]) => pts.length >= 2)
      .map(([wmo, points]) => ({ id: `trail-${wmo}`, points }));

    // 3. Gliders: Position precisely at the waypoint closest to current snapshot timestamp
    const positionedGliders = rawGliders.map(glider => {
      if (!glider.track || glider.track.length === 0) return glider;
      let bestIdx = 0;
      let minDiff = Infinity;
      glider.track.forEach((wp, idx) => {
        const diff = Math.abs(new Date(wp.timestamp).getTime() - frameTime);
        if (diff < minDiff) {
          minDiff = diff;
          bestIdx = idx;
        }
      });
      const currentTrackPt = glider.track[bestIdx];
      return {
        ...glider,
        latitude: currentTrackPt.latitude,
        longitude: currentTrackPt.longitude,
        depth: currentTrackPt.depth,
        variables: { ...glider.variables, ...currentTrackPt.variables }
      };
    });

    // 4. CTD & BGC: Filter by active window in the current snapshot
    const activeCTDs = (currentSnapshot.activeCTDIds && currentSnapshot.activeCTDIds.length > 0)
      ? rawCTDs.filter(c => currentSnapshot.activeCTDIds.includes(c.id))
      : rawCTDs;

    const activeBGCs = (currentSnapshot.activeBGCIds && currentSnapshot.activeBGCIds.length > 0)
      ? rawBGCs.filter(b => currentSnapshot.activeBGCIds.includes(b.id))
      : rawBGCs;

    return {
      dynamicArgos: snapshotArgos,
      argoTrails: trails,
      dynamicGliders: positionedGliders,
      visibleCTDs: activeCTDs,
      visibleBGCs: activeBGCs
    };
  }, [observations, replayMode, currentFrameIndex, instrumentSnapshots]);

  const moorings = observations.filter(o => o.type === 'mooring') as Mooring[];

  return (
    <group>
      {/* Historical Float Trajectory Trails */}
      {replayMode && argoTrails.map(trail => (
        <Line
          key={trail.id}
          points={trail.points}
          color="#ffb703"
          lineWidth={2.5}
          transparent
          opacity={0.85}
          dashed
          dashScale={2}
          dashSize={0.5}
          gapSize={0.3}
        />
      ))}

      {showArgo && <ArgoRenderer data={dynamicArgos} />}
      {showGliders && <GliderRenderer data={dynamicGliders} />}
      {showCTD && <CTDRenderer data={visibleCTDs} />}
      {showMoorings && <MooringRenderer data={moorings} />}
      {showBGC && <BGCRenderer data={visibleBGCs} />}
    </group>
  );
};
