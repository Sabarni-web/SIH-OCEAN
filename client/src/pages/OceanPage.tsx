import React from 'react';
import { OceanViewport } from '../components/OceanViewport';
import { GlobalOceanControls } from '../components/GlobalOceanControls';
import { LayerControls } from '../components/panels/LayerControls';

export const OceanPage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full h-full flex flex-col animate-in fade-in duration-500 space-y-4">
      <GlobalOceanControls />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[80vh] relative rounded-xl overflow-hidden border border-border/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <OceanViewport />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <LayerControls />
        </div>
      </div>
    </div>
  );
};
