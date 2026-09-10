import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useOceanStore } from '../../store/useOceanStore';
import { useObservationStore } from '../../store/useObservationStore';
import { OCEAN_VARIABLES } from '../../data/variables';
import { COLOR_SCALES, evaluateColor } from '../../three/colorScales';
import { Layers, MapPin, Compass, Wind, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

export const WorldMapViewer: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const canvasLayerRef = useRef<L.ImageOverlay | null>(null);

  const { selectedVariable, selectedDepth, selectedTime } = useOceanStore();
  const { observations, selectedObservationId, selectObservation, showArgo, showGliders, showCTD, showMoorings } = useObservationStore();

  const [mousePos, setMousePos] = useState<{ lat: number; lng: number; val: number | null }>({ lat: 10.0, lng: 75.0, val: 28.4 });
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showVectors, setShowVectors] = useState(true);
  const [basemap, setBasemap] = useState<'dark' | 'satellite'>('dark');

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [10, 78], // Centered on Indian Ocean & India
      zoom: 4,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    const cartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
    const darkUrl = cartoKey
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

    // CARTO Dark Matter Basemap (Authenticated)
    L.tileLayer(darkUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    if (!cartoKey) {
      // Add reference labels if fallback
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        opacity: 0.85
      }).addTo(map);
    }

    markersLayerRef.current = L.layerGroup().addTo(map);

    // Track mouse coordinates & estimated value
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const lat = Number(e.latlng.lat.toFixed(2));
      const lng = Number(e.latlng.lng.toFixed(2));
      
      // Calculate realistic field value based on latitude and depth
      let estimatedVal = 26;
      if (selectedVariable === 'temperature') {
        const tropicalGradient = (15 - Math.abs(lat)) * 0.4;
        estimatedVal = Math.max(2, 25 + tropicalGradient - (selectedDepth / 2000) * 20);
      } else if (selectedVariable === 'salinity') {
        estimatedVal = lat > 10 && lng < 75 ? 36.4 : 33.2; // Arabian Sea vs Bay of Bengal
      } else if (selectedVariable === 'current' || selectedVariable === 'currentVelocity') {
        estimatedVal = 0.65;
      }
      
      setMousePos({ lat, lng, val: Number(estimatedVal.toFixed(1)) });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Basemap Layer when toggled
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    if (basemap === 'dark') {
      const cartoKey = import.meta.env.VITE_CARTO_API_KEY || '';
      const darkUrl = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
        : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}';

      L.tileLayer(darkUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      if (!cartoKey) {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 16,
          opacity: 0.85
        }).addTo(map);
      }
    } else {
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
      }).addTo(map);
    }
  }, [basemap]);

  // Generate Scientific Scalar Field Canvas Overlay (Heatmap)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (canvasLayerRef.current) {
      map.removeLayer(canvasLayerRef.current);
      canvasLayerRef.current = null;
    }

    if (!showHeatmap) return;

    const width = 256;
    const height = 256;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    const varDef = OCEAN_VARIABLES[selectedVariable] || OCEAN_VARIABLES.temperature;
    const scale = COLOR_SCALES[varDef.colorScale] || COLOR_SCALES.thermal;

    const minLat = -35;
    const maxLat = 30;
    const minLon = 35;
    const maxLon = 115;

    for (let py = 0; py < height; py++) {
      const lat = maxLat - (py / height) * (maxLat - minLat);
      for (let px = 0; px < width; px++) {
        const lon = minLon + (px / width) * (maxLon - minLon);
        const idx = (py * width + px) * 4;

        // Skip landmass approx (India triangular rough check)
        const isIndia = lat >= 8 && lat <= 26 && lon >= 70 && lon <= 88 && (lon - 70) * (26 - lat) < 160 && (88 - lon) * (26 - lat) < 160;
        const isArabia = lat >= 13 && lat <= 28 && lon >= 42 && lon <= 58;
        const isAfrica = lat >= -30 && lat <= 12 && lon <= 45 && !(lat > -10 && lon > 40);

        if (isIndia || isArabia || isAfrica) {
          data[idx + 3] = 0; // Transparent over land
          continue;
        }

        // Fluid dynamic field value
        let val = 25;
        const wave = Math.sin(lat * 0.15 + selectedTime) * Math.cos(lon * 0.15 + selectedTime * 0.5);

        if (selectedVariable === 'temperature') {
          const latGradient = (20 - Math.abs(lat)) * 0.45;
          val = 24 + latGradient + wave * 2.0 - (selectedDepth / 2000) * 20;
        } else if (selectedVariable === 'salinity') {
          // Arabian sea (high salinity ~36.5) vs Bay of Bengal (~33.0)
          const basinBias = lon < 77 ? 36.2 : 33.5;
          val = basinBias + wave * 0.6;
        } else if (selectedVariable === 'current' || selectedVariable === 'currentVelocity') {
          val = Math.max(0.1, Math.abs(wave * 1.5));
        } else if (selectedVariable === 'chlorophyll') {
          val = Math.max(0.05, 1.2 + wave * 0.8);
        }

        const color = evaluateColor(val, varDef.min, varDef.max, scale);
        data[idx] = Math.round(color.r * 255);
        data[idx + 1] = Math.round(color.g * 255);
        data[idx + 2] = Math.round(color.b * 255);
        data[idx + 3] = 160; // 63% opacity
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const bounds: L.LatLngBoundsExpression = [[minLat, minLon], [maxLat, maxLon]];
    const overlay = L.imageOverlay(canvas.toDataURL(), bounds, {
      opacity: 0.75,
      interactive: false
    }).addTo(map);

    canvasLayerRef.current = overlay;
  }, [selectedVariable, selectedDepth, selectedTime, showHeatmap]);

  // Update In-Situ Observation Markers (100+ Live Argo Floats, Gliders, Moorings)
  useEffect(() => {
    const markersGroup = markersLayerRef.current;
    if (!markersGroup) return;

    markersGroup.clearLayers();

    observations.forEach((obs) => {
      if (obs.type === 'argo' && !showArgo) return;
      if (obs.type === 'glider' && !showGliders) return;
      if (obs.type === 'ctd' && !showCTD) return;
      if (obs.type === 'mooring' && !showMoorings) return;

      const isSelected = selectedObservationId === obs.id;

      let color = '#fb8500'; // Argo Yellow
      let label = 'ARGO';
      if (obs.type === 'glider') { color = '#06d6a0'; label = 'GLIDER'; }
      else if (obs.type === 'ctd') { color = '#118ab2'; label = 'CTD'; }
      else if (obs.type === 'mooring') { color = '#ef476f'; label = 'MOORING'; }

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          <div class="w-4 h-4 rounded-full flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-125" style="background-color: ${color}; border: 2px solid #ffffff;">
            <div class="w-1.5 h-1.5 bg-black rounded-full"></div>
          </div>
          ${isSelected ? `<div class="absolute w-8 h-8 rounded-full animate-ping opacity-75" style="border: 2px solid ${color};"></div>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-obs-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([obs.latitude, obs.longitude], { icon: customIcon });

      const popupContent = `
        <div style="font-family: system-ui, sans-serif; min-width: 160px; color: #fff; background: #0c1524; padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(0, 229, 255, 0.4);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="color: ${color}; font-size: 11px; text-transform: uppercase;">${label} ${(obs as any).wmoId || obs.id.slice(-6)}</strong>
            <span style="background: rgba(34,197,94,0.2); color: #4ade80; font-size: 9px; padding: 1px 4px; border-radius: 3px;">LIVE</span>
          </div>
          <div style="font-size: 10px; line-height: 1.5; color: #94a3b8;">
            <div>GPS: <strong style="color:#fff;">${obs.latitude.toFixed(2)}°N, ${obs.longitude.toFixed(2)}°E</strong></div>
            <div>Temp: <strong style="color:#38bdf8;">${obs.variables.temperature !== undefined ? `${obs.variables.temperature.toFixed(1)}°C` : 'N/A'}</strong></div>
            <div>Salinity: <strong style="color:#34d399;">${obs.variables.salinity !== undefined ? `${obs.variables.salinity.toFixed(1)} PSU` : 'N/A'}</strong></div>
          </div>
        </div>
      `;

      marker.bindTooltip(popupContent, {
        direction: 'top',
        offset: [0, -10],
        opacity: 0.95,
        className: 'custom-leaflet-tooltip'
      });

      marker.on('click', () => {
        selectObservation(obs.id);
      });

      marker.addTo(markersGroup);
    });
  }, [observations, selectedObservationId, showArgo, showGliders, showCTD, showMoorings]);

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([10, 78], 4);
    }
  };

  const zoomIn = () => mapInstanceRef.current?.zoomIn();
  const zoomOut = () => mapInstanceRef.current?.zoomOut();

  const varDef = OCEAN_VARIABLES[selectedVariable] || OCEAN_VARIABLES.temperature;

  return (
    <div className="relative w-full h-full rounded-b-xl overflow-hidden bg-[#070d18]">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Info Bar (Live Coordinates & Under-cursor Readings) */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 glass-panel px-3 py-1.5 rounded-lg border border-border/50 text-xs font-mono text-textSecondary select-none">
        <div className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-primary animate-spin-slow" />
          <span className="text-white font-bold">{mousePos.lat}°N, {mousePos.lng}°E</span>
        </div>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1.5">
          <span className="uppercase text-[11px] text-textSecondary">{varDef.name}:</span>
          <span className="text-cyan-300 font-bold">{mousePos.val !== null ? `${mousePos.val}${varDef.unit}` : '--'}</span>
        </div>
      </div>

      {/* Floating Map Controls (Zoom & Layer Toggles) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="glass-panel p-1.5 rounded-lg flex flex-col gap-1 border border-border/50">
          <button 
            onClick={zoomIn} 
            className="p-1.5 text-textSecondary hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={zoomOut} 
            className="p-1.5 text-textSecondary hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            onClick={resetView} 
            className="p-1.5 text-textSecondary hover:text-white hover:bg-white/10 rounded transition-colors border-t border-border/40 mt-1 pt-1.5"
            title="Reset to Indian Ocean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Layer Controls Pill */}
        <div className="glass-panel p-2 rounded-lg border border-border/50 space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setShowHeatmap(!showHeatmap)}>
            <span className="text-textSecondary">Heatmap Layer</span>
            <input type="checkbox" checked={showHeatmap} onChange={() => {}} className="accent-primary cursor-pointer" />
          </div>
          <div className="flex items-center justify-between gap-3 cursor-pointer" onClick={() => setBasemap(basemap === 'dark' ? 'satellite' : 'dark')}>
            <span className="text-textSecondary">Satellite View</span>
            <input type="checkbox" checked={basemap === 'satellite'} onChange={() => {}} className="accent-primary cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Region Water Labels Overlay */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2 glass-panel px-3 py-1.5 rounded-lg border border-border/50 text-[11px] font-mono text-cyan-400/80">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        <span>Indian Ocean Basin • Arabian Sea • Bay of Bengal</span>
      </div>
    </div>
  );
};
