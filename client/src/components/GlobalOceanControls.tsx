import React, { useEffect, useState } from 'react';
import { Play, RotateCcw, Thermometer, Wind, Droplets, Clock, ArrowDown, Search, Calendar, Check, RefreshCw, History } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';
import { useObservationStore, type DatePreset } from '../store/useObservationStore';
import { useReplayStore } from '../store/useReplayStore';

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

  const { 
    observations, 
    selectObservation, 
    datePreset, 
    startDate, 
    endDate, 
    setDateFilter,
    loading: obsLoading 
  } = useObservationStore();

  const {
    replayMode,
    replayLoading,
    replayFrames,
    currentFrameIndex,
    startReplay,
    stopReplay
  } = useReplayStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState('2024-05-01');
  const [customEnd, setCustomEnd] = useState('2024-05-31');

  const handleTriggerReplay = async () => {
    if (replayMode) {
      stopReplay();
      return;
    }

    if (isPlaying) {
      togglePlay();
    }

    let sDate = '';
    let eDate = new Date().toISOString().slice(0, 10);

    if (datePreset === '7d') {
      sDate = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    } else if (datePreset === '30d') {
      sDate = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().slice(0, 10);
    } else if (datePreset === 'custom') {
      sDate = startDate || customStart;
      eDate = endDate || customEnd;
    }

    if (sDate && eDate) {
      await startReplay(sDate, eDate);
    }
  };

  // Time animation effect is no longer needed since we use actual forecast frames via replay mode

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
      window.dispatchEvent(new Event('reset-camera'));
    }
  };

  const handleApplyCustomDate = async () => {
    if (!customStart || !customEnd) return;
    await setDateFilter('custom', customStart, customEnd);
    setShowDatePicker(false);
  };

  return (
    <div className="glass-panel-elevated p-4 rounded-xl mb-6 flex flex-col md:flex-row items-center justify-between gap-4 relative z-30">
      
      {/* Region & Variable */}
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-xs text-textSecondary uppercase tracking-wider mb-1 font-semibold">Region</label>
          <select 
            value={useOceanStore(s => s.selectedRegion)}
            onChange={async (e) => {
              const val = e.target.value;
              useOceanStore.getState().setSelectedRegion(val);
              
              // Predefined bounds matching LocationSetter
              const PRESETS: Record<string, any> = {
                'global': { minLat: -80, maxLat: 80, minLon: -180, maxLon: 180, latRes: 4, lonRes: 4 },
                'indian_ocean': { minLat: -30, maxLat: 30, minLon: 40, maxLon: 110, latRes: 2, lonRes: 2 },
                'pacific_ocean': { minLat: -60, maxLat: 60, minLon: 110, maxLon: 290, latRes: 3, lonRes: 3 },
                'atlantic_ocean': { minLat: -60, maxLat: 60, minLon: -70, maxLon: 20, latRes: 3, lonRes: 3 },
                'southern_ocean': { minLat: -90, maxLat: -50, minLon: -180, maxLon: 180, latRes: 3, lonRes: 3 },
                'arctic_ocean': { minLat: 60, maxLat: 90, minLon: -180, maxLon: 180, latRes: 3, lonRes: 3 }
              };
              
              if (PRESETS[val]) {
                useOceanStore.getState().setViewBounds(PRESETS[val]);
                window.dispatchEvent(new Event('reset-camera'));
                await useOceanStore.getState().fetchFieldData();
                await useObservationStore.getState().fetchObservations();
              }
            }}
            className="bg-background border border-border rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
          >
            <option value="global">Global Ocean</option>
            <option value="indian_ocean">Indian Ocean</option>
            <option value="pacific_ocean">Pacific Ocean</option>
            <option value="atlantic_ocean">Atlantic Ocean</option>
            <option value="southern_ocean">Southern Ocean</option>
            <option value="arctic_ocean">Arctic Ocean</option>
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
      <div className="flex-1 w-full flex flex-col px-4 md:px-6 max-w-2xl">
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

      {/* Time & Temporal Date Range Controls */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        
        {/* Date Filter Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 bg-background border border-border/70 hover:border-primary px-3 py-1.5 rounded-md text-xs font-mono text-white transition-colors"
            title="Filter by Date Range"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold">
              {datePreset === 'live' && '⚡ Live Fleet'}
              {datePreset === '7d' && '📅 Past 7 Days'}
              {datePreset === '30d' && '📅 Past 30 Days'}
              {datePreset === 'custom' && `${startDate} → ${endDate}`}
            </span>
            {obsLoading && <RefreshCw className="w-3 h-3 text-primary animate-spin ml-1" />}
          </button>

          {/* Date Picker Popover */}
          {showDatePicker && (
            <div className="absolute right-0 top-10 w-72 bg-[#0c1524] border border-border/80 shadow-2xl rounded-xl p-4 z-50 text-xs backdrop-blur-xl">
              <div className="flex items-center justify-between mb-3 border-b border-border/40 pb-2">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Date Filter
                </span>
                <span className="text-[10px] text-textSecondary">
                  {observations.length} sensors
                </span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <button
                  onClick={() => { setDateFilter('live'); setShowDatePicker(false); }}
                  className={`py-1 px-2 rounded font-medium border text-center transition-all ${
                    datePreset === 'live' 
                      ? 'bg-primary/20 text-primary border-primary/50 font-bold' 
                      : 'bg-surfaceElevated border-border/40 text-textSecondary hover:text-white'
                  }`}
                >
                  ⚡ Live
                </button>
                <button
                  onClick={() => { setDateFilter('7d'); setShowDatePicker(false); }}
                  className={`py-1 px-2 rounded font-medium border text-center transition-all ${
                    datePreset === '7d' 
                      ? 'bg-primary/20 text-primary border-primary/50 font-bold' 
                      : 'bg-surfaceElevated border-border/40 text-textSecondary hover:text-white'
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => { setDateFilter('30d'); setShowDatePicker(false); }}
                  className={`py-1 px-2 rounded font-medium border text-center transition-all ${
                    datePreset === '30d' 
                      ? 'bg-primary/20 text-primary border-primary/50 font-bold' 
                      : 'bg-surfaceElevated border-border/40 text-textSecondary hover:text-white'
                  }`}
                >
                  30 Days
                </button>
              </div>

              {/* Custom Date Range Picker */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-semibold text-textSecondary">Custom Range:</span>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <label className="text-[10px] text-textSecondary block mb-0.5">Start Date</label>
                    <input 
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-textSecondary block mb-0.5">End Date</label>
                    <input 
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full bg-background border border-border rounded px-2 py-1 text-white text-[11px] focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyCustomDate}
                  className="w-full mt-2 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded font-semibold transition-colors flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Apply Temporal Range
                </button>
              </div>
            </div>
          )}
        </div>

        {/* UTC Simulation Clock / Replay Clock */}
        <div className="flex items-center gap-2 bg-background border border-border rounded-md px-3 py-1.5 font-mono">
          <Clock className={`w-4 h-4 ${replayMode ? 'text-amber-400' : 'text-primary'} animate-pulse`} />
          <span className="text-xs font-semibold text-white">
            {replayMode && replayFrames[currentFrameIndex]
              ? replayFrames[currentFrameIndex].label
              : `${new Date(Date.now() + selectedTime * 3600 * 1000).toUTCString().slice(5, 22)} UTC`}
          </span>
          <span className={`text-[10px] ${
            replayMode 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
              : 'bg-primary/20 text-primary border-primary/30'
          } border px-1.5 py-0.2 rounded font-bold`}>
            {replayMode ? 'REPLAY' : selectedTime === 0 ? 'NOW' : `+${selectedTime}h`}
          </span>
        </div>
        
        {/* Play, Replay & Reset Buttons */}
        <div className="flex items-center gap-2">
          {/* Forward Forecast Play Button */}
          <button 
            onClick={async () => {
              if (replayMode) {
                stopReplay();
              } else {
                const today = new Date();
                const future = new Date(today.getTime() + 3 * 24 * 3600 * 1000);
                setDateFilter('live');
                await startReplay(today.toISOString().slice(0, 10), future.toISOString().slice(0, 10));
              }
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              replayMode && datePreset === 'live'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.3)]'
                : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50'
            }`}
            title={replayMode && datePreset === 'live' ? 'Stop Forecast Simulation' : 'Run 3-Day Forward Forecast'}
          >
            {replayLoading && datePreset === 'live' ? (
              <span className="w-3.5 h-3.5 flex items-center justify-center"><div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" /></span>
            ) : replayMode && datePreset === 'live' ? (
              <span className="w-3.5 h-3.5 flex items-center justify-center font-bold">||</span>
            ) : (
              <Play className="w-3.5 h-3.5 fill-primary" />
            )}
            <span>{replayLoading && datePreset === 'live' ? 'Loading...' : replayMode && datePreset === 'live' ? 'Stop' : 'Forecast'}</span>
          </button>

          {/* Historical Temporal Replay Button (Available for 7d, 30d, and Custom ranges) */}
          {datePreset !== 'live' && (
            <button
              onClick={handleTriggerReplay}
              disabled={replayLoading}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                replayMode
                  ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                  : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/40'
              }`}
              title="Replay Historical Current Flow Over Time"
            >
              <History className={`w-3.5 h-3.5 ${replayLoading ? 'animate-spin' : ''}`} />
              <span>{replayLoading ? 'Loading...' : replayMode ? 'Replaying' : 'Replay'}</span>
            </button>
          )}
          
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

