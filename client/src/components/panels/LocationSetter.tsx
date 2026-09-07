import React from 'react';
import { useOceanStore } from '../../store/useOceanStore';
import type { ViewBounds } from '../../store/useOceanStore';

const PRESETS = [
  {
    name: 'Global Ocean',
    bounds: { minLat: -80, maxLat: 80, minLon: -180, maxLon: 180, latRes: 4, lonRes: 4 }
  },
  {
    name: 'Indian Ocean',
    bounds: { minLat: -30, maxLat: 30, minLon: 40, maxLon: 110, latRes: 2, lonRes: 2 }
  },
  {
    name: 'Pacific Ocean',
    bounds: { minLat: -60, maxLat: 60, minLon: 110, maxLon: 290, latRes: 3, lonRes: 3 }
  },
  {
    name: 'Atlantic Ocean',
    bounds: { minLat: -60, maxLat: 60, minLon: -70, maxLon: 20, latRes: 3, lonRes: 3 }
  },
  {
    name: 'Southern Ocean',
    bounds: { minLat: -90, maxLat: -50, minLon: -180, maxLon: 180, latRes: 3, lonRes: 3 }
  },
  {
    name: 'Arctic Ocean',
    bounds: { minLat: 60, maxLat: 90, minLon: -180, maxLon: 180, latRes: 3, lonRes: 3 }
  }
];

export const LocationSetter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { setViewBounds, fetchFieldData, setSelectedRegion } = useOceanStore();

  const getRegionValue = (name: string) => {
    switch (name) {
      case 'Global Ocean': return 'global';
      case 'Indian Ocean': return 'indian_ocean';
      case 'Pacific Ocean': return 'pacific_ocean';
      case 'Atlantic Ocean': return 'atlantic_ocean';
      case 'Southern Ocean': return 'southern_ocean';
      case 'Arctic Ocean': return 'arctic_ocean';
      default: return 'indian_ocean';
    }
  }

  const handleSelect = async (preset: typeof PRESETS[0]) => {
    setViewBounds(preset.bounds);
    setSelectedRegion(getRegionValue(preset.name));
    onClose();
    window.dispatchEvent(new Event('reset-camera'));
    await fetchFieldData();
  };

  return (
    <div className="absolute top-12 right-4 w-64 bg-surfaceElevated border border-border/50 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
      <h3 className="text-sm font-semibold text-white mb-3">Set Location (3D View)</h3>
      <div className="flex flex-col gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleSelect(preset)}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors text-left border border-transparent hover:border-border/50 group"
          >
            <span className="text-sm text-textSecondary group-hover:text-primary transition-colors">
              {preset.name}
            </span>
            <span className="text-[10px] text-textSecondary opacity-50 font-mono">
              {preset.bounds.latRes}° res
            </span>
          </button>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-[10px] text-textSecondary text-center">
          Note: Global views use lower resolution to prevent API timeouts.
        </p>
      </div>
    </div>
  );
};
