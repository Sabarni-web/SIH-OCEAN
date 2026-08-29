import React from 'react';
import { Layers, Navigation, Plane, Anchor, Activity, Wind, Eye, Droplet } from 'lucide-react';
import { useOceanStore } from '../../store/useOceanStore';
import { useObservationStore } from '../../store/useObservationStore';

export const LayerControls: React.FC = () => {
  const { layers, toggleLayer } = useOceanStore();
  const { showArgo, showGliders, showCTD, showMoorings, showBGC, toggleArgo, toggleGliders, toggleCTD, toggleMoorings, toggleBGC } = useObservationStore();

  const LAYER_CONFIG = [
    { id: 'model', label: 'Model Data', icon: Layers, isActive: layers.model, toggle: () => toggleLayer('model') },
    { id: 'currents', label: 'Current Vectors', icon: Wind, isActive: layers.currents, toggle: () => toggleLayer('currents') },
    { id: 'bathymetry', label: 'Bathymetry', icon: Eye, isActive: layers.bathymetry, toggle: () => toggleLayer('bathymetry') },
    { id: 'isosurface', label: 'Isosurface', icon: Eye, isActive: layers.isosurface, toggle: () => toggleLayer('isosurface') },
    
    // Observations
    { id: 'argo', label: 'Argo Floats', icon: Navigation, isActive: showArgo, toggle: toggleArgo },
    { id: 'gliders', label: 'Glider Tracks', icon: Plane, isActive: showGliders, toggle: toggleGliders },
    { id: 'ctd', label: 'CTD Stations', icon: Droplet, isActive: showCTD, toggle: toggleCTD },
    { id: 'moorings', label: 'Moorings', icon: Anchor, isActive: showMoorings, toggle: toggleMoorings },
    { id: 'bgc', label: 'BGC Observations', icon: Activity, isActive: showBGC, toggle: toggleBGC },
  ] as const;

  return (
    <div className="glass-panel p-4 rounded-xl">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary mb-4">Layer Controls</h3>
      
      <div className="space-y-3">
        {LAYER_CONFIG.map((layer) => {
          return (
            <div key={layer.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <layer.icon className={`w-4 h-4 ${layer.isActive ? 'text-primary' : 'text-textSecondary'}`} />
                <span className={`text-sm ${layer.isActive ? 'text-white font-medium' : 'text-textSecondary'}`}>
                  {layer.label}
                </span>
              </div>
              
              <button 
                onClick={layer.toggle}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                  layer.isActive ? 'bg-primary' : 'bg-surfaceElevated border border-border/50'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    layer.isActive ? 'translate-x-4.5' : 'translate-x-1 opacity-70'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
