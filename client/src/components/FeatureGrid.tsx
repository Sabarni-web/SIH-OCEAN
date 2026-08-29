import React from 'react';
import { BoxSelect, Clock, AlignVerticalJustifyStart, Wind, Eye, FileJson, Globe } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      title: 'Depth Slice Explorer',
      desc: 'Explore ocean layers at different depths',
      icon: BoxSelect,
      visual: <div className="h-20 w-full bg-gradient-to-b from-blue-400/20 to-blue-900/20 border-y border-primary/30 my-2 rounded"></div>
    },
    {
      title: 'Time Animation',
      desc: 'Temporal evolution of ocean state',
      icon: Clock,
      visual: (
        <div className="w-full flex items-center justify-between text-xs text-primary/70 my-6 px-2">
          <span>00:00</span>
          <div className="flex-1 h-px bg-border mx-2 relative">
            <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-primary rounded-full -translate-y-1/2 shadow-[0_0_8px_#00d4ff]"></div>
          </div>
          <span>12:00</span>
        </div>
      )
    },
    {
      title: 'Vertical Cross Section',
      desc: 'Scientific cross-section preview',
      icon: AlignVerticalJustifyStart,
      visual: <div className="h-20 w-full bg-[linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] my-2 border border-border rounded"></div>
    },
    {
      title: 'Current Vector Visualization',
      desc: 'Flow-field preview',
      icon: Wind,
      visual: (
        <div className="relative h-20 w-full my-2 opacity-60">
          <Wind className="absolute top-2 left-4 text-cyan-400" />
          <Wind className="absolute bottom-4 right-8 text-cyan-500" />
          <Wind className="absolute top-6 right-16 text-cyan-300" />
        </div>
      )
    },
    {
      title: 'Isosurface 3D View',
      desc: '3D scientific surface preview',
      icon: Eye,
      visual: <div className="h-20 w-full rounded-full border border-primary/40 scale-y-50 my-2 bg-primary/10"></div>
    },
    {
      title: 'Multi-format Data Ingestion',
      desc: 'Supports multiple scientific data formats',
      icon: FileJson,
      visual: (
        <div className="flex flex-wrap gap-2 justify-center my-4">
          {['.NETCDF', '.CSV', '.ASCII', '.JSON'].map(fmt => (
            <span key={fmt} className="text-[10px] font-mono bg-surfaceElevated px-2 py-1 rounded border border-border text-primary">{fmt}</span>
          ))}
        </div>
      )
    },
  ];

  return (
    <div className="mt-8 mb-12">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary mb-4">Key Features of Our Platform</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-xl hover:border-primary/50 transition-colors group">
            <div className="flex items-center gap-3 mb-2">
              <feature.icon className="w-5 h-5 text-primary" />
              <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
            </div>
            {feature.visual}
            <p className="text-xs text-textSecondary">{feature.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 glass-panel-elevated p-6 rounded-xl text-center border-t-2 border-t-primary">
        <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
        <h4 className="text-lg font-bold text-white mb-2">Impact & Applications</h4>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {['Fisheries & Coastal Management', 'Climate & Monsoon Research', 'Marine Disaster Warning', 'Ocean Health Monitoring', 'Scientific Research', 'Education & Capacity Building'].map((app, i) => (
            <span key={i} className="bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-xs font-medium">
              {app}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
