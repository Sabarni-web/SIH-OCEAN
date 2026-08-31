import React, { useState } from 'react';
import { Layers, Thermometer, Wind, Waves, Eye, MousePointer2, Download, AlertTriangle, Check } from 'lucide-react';
import { useAnalyticsStore } from '../../store/useAnalyticsStore';

export const AnalyticsToolbar: React.FC = () => {
  const [downloaded, setDownloaded] = useState(false);
  const {
    depthSliceEnabled, setDepthSliceEnabled,
    isosurfaceEnabled, setIsosurfaceEnabled,
    vectorEnabled, setVectorEnabled,
    particleEnabled, setParticleEnabled,
    probeEnabled, setProbeEnabled,
    bathymetryEnabled, setBathymetryEnabled,
    anomalyEnabled, setAnomalyEnabled
  } = useAnalyticsStore();

  const handleCaptureScreenshot = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ocean-vista-3d-scene-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('Failed to capture canvas:', err);
    }
  };

  const tools = [
    { id: 'probe', label: 'Data Probe HUD', icon: MousePointer2, state: probeEnabled, toggle: setProbeEnabled },
    { id: 'depth', label: 'Depth Slicing Plane', icon: Layers, state: depthSliceEnabled, toggle: setDepthSliceEnabled },
    { id: 'iso', label: '3D Isosurface Extraction', icon: Thermometer, state: isosurfaceEnabled, toggle: setIsosurfaceEnabled },
    { id: 'vector', label: 'Current Vector Field Grid', icon: Wind, state: vectorEnabled, toggle: setVectorEnabled },
    { id: 'particles', label: 'Particle Flow Simulation', icon: Waves, state: particleEnabled, toggle: setParticleEnabled },
    { id: 'bathy', label: 'Seafloor Bathymetry Terrain', icon: Eye, state: bathymetryEnabled, toggle: setBathymetryEnabled },
    { id: 'anomaly', label: 'Marine Heatwave / Anomaly Alerts', icon: AlertTriangle, state: anomalyEnabled, toggle: setAnomalyEnabled }
  ];

  return (
    <div className="absolute top-14 left-4 z-10 flex flex-col gap-2">
      <div className="glass-panel p-2 rounded-xl flex flex-col gap-2 bg-surface/90 border border-primary/20 backdrop-blur-md shadow-2xl">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => tool.toggle(!tool.state)}
            className={`p-2 rounded-lg flex items-center justify-center transition-all group relative ${tool.state ? 'bg-primary/20 text-primary border border-primary/60 shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'bg-surfaceElevated text-textSecondary border border-border/50 hover:text-white hover:border-primary/40'}`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
            <div className="absolute left-full ml-2 px-2.5 py-1 bg-surfaceElevated/95 border border-primary/40 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30 shadow-xl backdrop-blur-md transition-opacity">
              <span className="font-semibold">{tool.label}</span>
              <span className={`block text-[10px] ${tool.state ? 'text-primary' : 'text-textSecondary'}`}>
                {tool.state ? '● Active' : '○ Click to toggle'}
              </span>
            </div>
          </button>
        ))}
      </div>

      <button 
        onClick={handleCaptureScreenshot}
        className={`glass-panel p-2 rounded-xl flex items-center justify-center transition-all group relative border ${downloaded ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-surface/90 text-textSecondary hover:text-white hover:border-primary/50 border-primary/20'}`}
        title="Export 3D Scene Screenshot"
      >
        {downloaded ? <Check className="w-5 h-5 text-green-400" /> : <Download className="w-5 h-5" />}
        <div className="absolute left-full ml-2 px-2.5 py-1 bg-surfaceElevated/95 border border-primary/40 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-30 shadow-xl backdrop-blur-md transition-opacity">
          <span className="font-semibold">{downloaded ? 'Screenshot Downloaded!' : 'Export 3D Scene (PNG)'}</span>
        </div>
      </button>
    </div>
  );
};
