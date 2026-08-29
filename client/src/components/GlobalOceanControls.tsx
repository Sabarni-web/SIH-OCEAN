import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Thermometer, Wind, Droplets, Clock, ArrowDown, Search } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';
import { useObservationStore } from '../store/useObservationStore';

export const GlobalOceanControls: React.FC = () => {
  const { 
    selectedVariable, 
    setSelectedVariable, 
    selectedDepth, 
    setSelectedDepth, 
    isPlaying, 
    togglePlay,
    selectedTime,
    setSelectedTime
  } = useOceanStore();

  const { observations, selectObservation } = useObservationStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Time animation effect
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setSelectedTime((selectedTime + 1) % 24); // 24 hour mock loop
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedTime, setSelectedTime]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    const match = observations.find(o => 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (o as any).wmoId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o as any).deploymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o as any).cruiseId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o as any).stationId?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      selectObservation(match.id);
      window.dispatchEvent(new Event('reset-camera')); // optionally trigger a camera focus
    }
  };

  return (
    <div className="glass-panel-elevated p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
      
      {/* Region & Variable */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-xs text-textSecondary uppercase tracking-wider mb-1 font-semibold">Region</label>
          <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary">
            <option value="indian_ocean">Indian Ocean</option>
            <option value="global">Global</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-textSecondary uppercase tracking-wider mb-1 font-semibold">Variable</label>
          <div className="relative">
            <select 
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
              className="bg-background border border-border rounded-md px-3 py-1.5 pl-8 text-sm text-white focus:outline-none focus:border-primary appearance-none min-w-[150px]"
            >
              <option value="temperature">Temperature</option>
              <option value="salinity">Salinity</option>
              <option value="current">Current Velocity</option>
              <option value="chlorophyll">Chlorophyll</option>
            </select>
            {selectedVariable === 'temperature' && <Thermometer className="absolute left-2 top-1.5 w-4 h-4 text-primary" />}
            {selectedVariable === 'salinity' && <Droplets className="absolute left-2 top-1.5 w-4 h-4 text-primary" />}
            {selectedVariable === 'current' && <Wind className="absolute left-2 top-1.5 w-4 h-4 text-primary" />}
          </div>
        </div>
      </div>

      {/* Depth Slider */}
      <div className="flex-1 w-full flex flex-col px-4 md:px-8 max-w-2xl">
        <div className="flex justify-between mb-1">
          <label className="text-xs text-textSecondary uppercase tracking-wider font-semibold flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> Depth
          </label>
          <span className="text-xs font-bold text-primary">{selectedDepth}m</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-textSecondary">0m</span>
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="50"
            value={selectedDepth}
            onChange={(e) => setSelectedDepth(Number(e.target.value))}
            className="w-full accent-primary h-1.5 bg-background rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-textSecondary">5000m</span>
        </div>
      </div>

      {/* Time & Play Controls */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">15 Nov 2024 • 12:00 UTC</span>
        </div>
        
        <div className="flex items-center gap-2">
          
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
            <Search className="w-4 h-4 text-textSecondary absolute left-2" />
            <input 
              type="text" 
              placeholder="Search ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background border border-border rounded-md pl-8 pr-2 py-1.5 text-sm text-white focus:outline-none focus:border-primary w-32 transition-all"
            />
          </form>

          <button 
            onClick={togglePlay}
            className="flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-4 py-1.5 rounded-md transition-all shadow-[0_0_10px_rgba(0,212,255,0.2)]"
          >
            {isPlaying ? (
              <span className="w-4 h-4 flex items-center justify-center font-bold">||</span>
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span className="text-sm font-bold">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
          
          <button 
            onClick={() => window.dispatchEvent(new Event('reset-camera'))}
            className="p-1.5 text-textSecondary hover:text-white bg-background border border-border rounded-md transition-colors" 
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
