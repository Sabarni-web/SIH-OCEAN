import React from 'react';
import { useObservationStore } from '../store/useObservationStore';
import { ArgoRenderer } from './ArgoRenderer';
import { GliderRenderer } from './GliderRenderer';
import { CTDRenderer } from './CTDRenderer';
import { MooringRenderer } from './MooringRenderer';
import { BGCRenderer } from './BGCRenderer';
import type { Observation } from '../../../shared/types';

export const ObservationSystem: React.FC = () => {
  const { observations, showArgo, showGliders, showCTD, showMoorings, showBGC } = useObservationStore();

  const argos = observations.filter(o => o.type === 'argo') as any[];
  const gliders = observations.filter(o => o.type === 'glider') as any[];
  const ctds = observations.filter(o => o.type === 'ctd') as any[];
  const moorings = observations.filter(o => o.type === 'mooring') as any[];
  const bgcs = observations.filter(o => o.type === 'bgc') as any[];

  return (
    <group>
      {showArgo && <ArgoRenderer data={argos} />}
      {showGliders && <GliderRenderer data={gliders} />}
      {showCTD && <CTDRenderer data={ctds} />}
      {showMoorings && <MooringRenderer data={moorings} />}
      {showBGC && <BGCRenderer data={bgcs} />}
    </group>
  );
};
