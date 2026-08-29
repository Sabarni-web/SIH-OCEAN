import React from 'react';
import { ComparisonPanel } from '../components/panels/ComparisonPanel';

export const ComparePage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Model vs Observation</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md">
           <h2 className="text-xl font-semibold mb-4">Comparison Workspace</h2>
           <ComparisonPanel />
        </div>
      </div>
    </div>
  );
};
