import React from 'react';
import { Thermometer, Droplets, Wind, Activity, AlignEndVertical, Eye } from 'lucide-react';
import { useOceanStore } from '../store/useOceanStore';
import { OCEAN_VARIABLES } from '../data/variables';

export const VariableCards: React.FC = () => {
  const { selectedVariable, setSelectedVariable } = useOceanStore();

  const variables = [
    { id: 'temperature', icon: Thermometer, color: 'text-red-400' },
    { id: 'salinity', icon: Droplets, color: 'text-blue-400' },
    { id: 'currentVelocity', icon: Wind, color: 'text-cyan-400' },
    { id: 'currentDirection', icon: Eye, color: 'text-purple-400' },
    { id: 'chlorophyll', icon: Activity, color: 'text-green-400' },
    { id: 'dissolvedOxygen', icon: Eye, color: 'text-indigo-400' },
    { id: 'mixedLayerDepth', icon: AlignEndVertical, color: 'text-orange-400' },
  ];

  return (
    <div className="mt-6 mb-8">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary mb-4">Other Variables</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {variables.map((v) => {
          const isActive = selectedVariable === v.id;
          const def = OCEAN_VARIABLES[v.id];
          return (
            <button
              key={v.id}
              onClick={() => setSelectedVariable(v.id)}
              className={`glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 ${
                isActive 
                  ? 'border-primary shadow-[0_0_15px_rgba(0,212,255,0.2)] bg-primary/10 transform -translate-y-1' 
                  : 'hover:bg-white/5 hover:-translate-y-1'
              }`}
            >
              <v.icon className={`w-8 h-8 mb-3 ${isActive ? 'text-primary' : v.color}`} />
              <span className="text-xs font-semibold text-textSecondary mb-1 line-clamp-1">{def?.name}</span>
              <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-textPrimary'}`}>
                <span className="text-[10px] text-textSecondary">{def?.unit}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
