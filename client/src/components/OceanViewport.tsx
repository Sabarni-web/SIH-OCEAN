import React from 'react';
import { Layers, Maximize, Settings } from 'lucide-react';
import { OceanScene } from '../three/OceanScene';
import { ReplayTimeline } from './ReplayTimeline';
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
    <div className="flex flex-col h-full glass-panel-elevated rounded-xl border border-border flex-1 relative">
      {/* Header / Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-surface/50 rounded-t-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setVisualizationMode(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${visualizationMode === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_10px_rgba(0,212,255,0.2)]'
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
      <div className="flex-1 relative overflow-hidden rounded-b-xl">
        <OceanScene />

        {/* Temporal Replay Scrubber Bar */}
        <ReplayTimeline />

        {/* Colorbar Overlay */}
        <div className="absolute right-4 bottom-8 glass-panel p-2 rounded-lg flex gap-2 z-20 shadow-2xl backdrop-blur-md">
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
                  className="w-3.5 h-28 rounded border border-border/50"
                  style={{ background: `linear-gradient(to top, ${gradientStops})` }}
                ></div>
                <div className="flex flex-col justify-between text-[10px] font-mono text-textSecondary py-0.5">
                  <span className="font-bold text-red-400">{variable.max}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.75).toFixed(1)}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.5).toFixed(1)}{variable.unit}</span>
                  <span>{(variable.min + (variable.max - variable.min) * 0.25).toFixed(1)}{variable.unit}</span>
                  <span className="font-bold text-blue-400">{variable.min}{variable.unit}</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

