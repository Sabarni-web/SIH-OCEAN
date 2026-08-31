import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useObservationStore } from '../../store/useObservationStore';
import { useOceanStore } from '../../store/useOceanStore';
import { useReplayStore } from '../../store/useReplayStore';
import { Compass, Maximize2, Satellite, Globe } from 'lucide-react';

export const OceanMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapMode, setMapMode] = useState<'dark' | 'satellite'>('dark');

  const { observations, selectedObservationId, selectObservation } = useObservationStore();
  const { setVisualizationMode } = useOceanStore();
  const { replayMode, currentFrameIndex, totalFrames, instrumentSnapshots } = useReplayStore();

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10, 78], // Centered on India & Indian Ocean
      zoom: 3,
      minZoom: 2,
      maxZoom: 9,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: true,
      dragging: true
    });

    mapInstanceRef.current = map;

    tileLayerGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Basemap Tiles (Dark vs Satellite)
  useEffect(() => {
    const tileGroup = tileLayerGroupRef.current;
    if (!tileGroup) return;

    tileGroup.clearLayers();

    if (mapMode === 'satellite') {
      // High-resolution Esri World Imagery Satellite Tiles
      const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri Satellite'
      });
      // Boundaries and Places Label Overlay
      const labelLayer = L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.8
      });

      tileGroup.addLayer(satLayer);
      tileGroup.addLayer(labelLayer);
    } else {
      // Authenticated CARTO Dark Matter Basemap
      const cartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
      const darkUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
        : 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

      const darkLayer = L.tileLayer(darkUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      });
      tileGroup.addLayer(darkLayer);
    }
  }, [mapMode]);

  // Update Live Float Pins on the Mini Map (Synchronized with Historical Replay)
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    group.clearLayers();

    const currentSnapshot = (replayMode && instrumentSnapshots) ? instrumentSnapshots[currentFrameIndex] : null;
    const argoSnapshotMap = currentSnapshot?.argos ? new Map(currentSnapshot.argos.map(a => [a.wmoId, a])) : null;
    const frameTime = currentSnapshot ? new Date(currentSnapshot.timestamp).getTime() : Date.now();

    observations.forEach((obs) => {
      // Visibility filtering for CTD & BGC during replay
      if (currentSnapshot) {
        if (obs.type === 'ctd' && currentSnapshot.activeCTDIds && currentSnapshot.activeCTDIds.length > 0) {
          if (!currentSnapshot.activeCTDIds.includes(obs.id)) return;
        }
        if (obs.type === 'bgc' && currentSnapshot.activeBGCIds && currentSnapshot.activeBGCIds.length > 0) {
          if (!currentSnapshot.activeBGCIds.includes(obs.id)) return;
        }
      }

      const isSelected = selectedObservationId === obs.id;

      let color = '#fb8500'; // Argo Yellow
      if (obs.type === 'glider') color = '#06d6a0';
      else if (obs.type === 'ctd') color = '#118ab2';
      else if (obs.type === 'mooring') color = '#ef476f';
      else if (obs.type === 'bgc') color = '#a200ff';

      let lat = obs.latitude;
      let lon = obs.longitude;

      if (currentSnapshot && obs.type === 'argo' && argoSnapshotMap) {
        const snapFloat = argoSnapshotMap.get((obs as any).wmoId);
        if (snapFloat) {
          lat = snapFloat.latitude;
          lon = snapFloat.longitude;
        }
      } else if (currentSnapshot && obs.type === 'glider' && (obs as any).track?.length > 0) {
        const track = (obs as any).track;
        let bestIdx = 0;
        let minDiff = Infinity;
        track.forEach((wp: any, idx: number) => {
          const diff = Math.abs(new Date(wp.timestamp).getTime() - frameTime);
          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = idx;
          }
        });
        lat = track[bestIdx].latitude;
        lon = track[bestIdx].longitude;
      }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-2.5 h-2.5 rounded-full shadow-md transition-transform transform hover:scale-150" style="background-color: ${color}; border: 1.5px solid #ffffff;"></div>
          ${isSelected ? `<div class="absolute w-5 h-5 rounded-full animate-ping opacity-75" style="border: 2px solid ${color};"></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-mini-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      const wmoText = (obs as any).wmoId 
        ? `WMO #${(obs as any).wmoId}` 
        : (obs as any).stationId 
        ? (obs as any).stationId 
        : (obs as any).deploymentId 
        ? (obs as any).deploymentId 
        : (obs as any).cruiseId 
        ? (obs as any).cruiseId 
        : obs.id;

      marker.bindTooltip(`
        <div style="background:#0c1524; color:#fff; font-size:10px; padding:3px 6px; border-radius:4px; border:1px solid rgba(0,229,255,0.4);">
          <strong style="color:${color}">${obs.type.toUpperCase()}</strong>: ${wmoText}
        </div>
      `, { direction: 'top', offset: [0, -6], opacity: 0.95 });

      marker.on('click', () => {
        selectObservation(obs.id);
      });

      marker.addTo(group);
    });
  }, [observations, selectedObservationId, selectObservation, replayMode, currentFrameIndex, instrumentSnapshots]);

  return (
    <div className="glass-panel p-4 rounded-xl flex flex-col h-[300px] relative">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-textSecondary flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-primary" /> Live GIS Radar
        </h3>
        <div className="flex items-center gap-1.5">
          {/* Satellite vs Dark Mode Switcher */}
          <div className="flex items-center bg-surface/80 p-0.5 rounded-md border border-border/50">
            <button
              onClick={() => setMapMode('dark')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 transition-all ${
                mapMode === 'dark'
                  ? 'bg-primary/20 text-primary border border-primary/40 shadow-sm'
                  : 'text-textSecondary hover:text-white'
              }`}
              title="Dark Radar GIS"
            >
              <Globe className="w-2.5 h-2.5" /> Dark
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`px-1.5 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 transition-all ${
                mapMode === 'satellite'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-textSecondary hover:text-white'
              }`}
              title="True Satellite Imagery View"
            >
              <Satellite className="w-2.5 h-2.5" /> Satellite
            </button>
          </div>

          <span className="text-[10px] px-1.5 py-0.2 bg-green-500/20 text-green-400 border border-green-500/30 rounded font-semibold">
            {observations.length}
          </span>
          <button 
            onClick={() => setVisualizationMode('map')}
            className="p-1 hover:bg-white/10 rounded text-textSecondary hover:text-primary transition-colors"
            title="Expand to Fullscreen Map"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Live Mini Map Container */}
      <div className="flex-1 rounded-lg overflow-hidden border border-border/50 relative bg-[#070d18] mb-2">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-textSecondary font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#fb8500]"></span> Argo Float
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#06d6a0]"></span> Glider
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#118ab2]"></span> CTD Station
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#ef476f]"></span> Moored Buoy
        </div>
      </div>
    </div>
  );
};
