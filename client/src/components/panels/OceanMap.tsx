import React from 'react';
import { Navigation, Plane, Anchor, Activity } from 'lucide-react';

export const OceanMap: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col h-[280px]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary mb-3">Region Map</h3>
      
      <div className="flex-1 bg-surfaceElevated border border-border/50 rounded-lg relative overflow-hidden mb-3 group">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[#0a192f]" />
        
        {/* Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
        
        {/* Landmass Mock (SVG Path) */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 text-secondary fill-current" preserveAspectRatio="none">
          <path d="M0,0 L30,0 L40,20 L35,40 L10,35 Z" />
          <path d="M80,0 L100,0 L100,80 L70,90 L60,60 Z" />
        </svg>

        {/* Markers */}
        <div className="absolute top-[40%] left-[60%] text-[#ffaa00] animate-pulse">
          <Navigation className="w-3 h-3 fill-current" />
        </div>
        <div className="absolute top-[30%] left-[50%] text-[#ffaa00]">
          <Navigation className="w-3 h-3 fill-current" />
        </div>
        <div className="absolute top-[60%] left-[40%] text-[#00ff88]">
          <Plane className="w-3 h-3 fill-current" />
        </div>
        <div className="absolute top-[70%] left-[75%] text-[#ff3366]">
          <Anchor className="w-3 h-3 fill-current" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] text-textSecondary font-medium">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-primary rounded-sm opacity-50 border border-primary"></span> Model Grid</div>
        <div className="flex items-center gap-1.5"><Navigation className="w-3 h-3 text-[#ffaa00]" /> Argo Float</div>
        <div className="flex items-center gap-1.5"><Plane className="w-3 h-3 text-[#00ff88]" /> Glider</div>
        <div className="flex items-center gap-1.5"><Anchor className="w-3 h-3 text-[#ff3366]" /> Mooring</div>
      </div>
    </div>
  );
};
