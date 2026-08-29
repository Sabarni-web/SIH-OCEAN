import React from 'react';
import { Layers, Maximize, Settings } from 'lucide-react';
import { OceanScene } from '../three/OceanScene';
import { useOceanStore } from '../store/useOceanStore';

import { OCEAN_VARIABLES } from '../data/variables';
import { COLOR_SCALES } from '../three/colorScales';

const TABS = [
  { id: '3d', label: '3D Ocean View' },
  { id: 'slices', label: 'Depth Slices' },
  { id: 'vertical', label: 'Vertical Section' },
  { id: 'iso', label: 'Isosurface' },
];

export const OceanViewport: React.FC = () => {
  const { visualizationMode, setVisualizationMode, selectedVariable } = useOceanStore();

  return (
    <div className="flex flex-col h-[600px] glass-panel-elevated rounded-xl border border-border flex-1 relative">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/50 rounded-t-xl">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVisualizationMode(tab.id as any)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                visualizationMode === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_8px_rgba(0,212,255,0.15)]'
                  : 'text-textSecondary hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-1.5 text-textSecondary hover:text-primary transition-colors" title="Layers">
            <Layers className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-textSecondary hover:text-primary transition-colors" title="Settings">
            <Settings className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-textSecondary hover:text-primary transition-colors border-l border-border/50 pl-3 ml-1" title="Fullscreen">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Content */}
      <div className="flex-1 relative">
        <OceanScene />
        
        {/* Colorbar Overlay */}
        <div className="absolute right-4 bottom-8 glass-panel p-2 rounded-lg flex gap-2">
          {(() => {
            const variable = OCEAN_VARIABLES[selectedVariable];
            if (!variable) return null;
            
            const scaleConfig = COLOR_SCALES[variable.colorScale];
            if (!scaleConfig) return null;

            // Generate CSS gradient string
            const gradientStops = scaleConfig.stops.map(
              (stop: any) => `${stop.color} ${stop.value * 100}%`
            ).join(', ');

            return (
              <>
                <div 
                  className="w-4 h-32 rounded border border-border"
                  style={{ background: `linear-gradient(to top, ${gradientStops})` }}
                ></div>
                <div className="flex flex-col justify-between text-[10px] font-mono text-textSecondary py-1">
                  <span>{variable.max}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.75).toFixed(1)}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.5).toFixed(1)}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.25).toFixed(1)}{variable.unit}</span>
                  <span>{variable.min}{variable.unit}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
