import React from 'react';
import { AnalyticsPanel } from '../components/panels/AnalyticsPanel';
import { AnalyticsToolbar } from '../components/panels/AnalyticsToolbar';
import { DepthProfileChart } from '../components/panels/DepthProfileChart';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 h-full flex flex-col">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Ocean Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-1 p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md space-y-6 flex flex-col">
          <AnalyticsToolbar />
          <AnalyticsPanel />
        </div>
        <div className="lg:col-span-1 space-y-6 flex flex-col">
          <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md flex-1 flex flex-col">
            <h2 className="text-xl font-semibold mb-4">Depth Profile</h2>
            <DepthProfileChart />
          </div>
        </div>
      </div>
    </div>
  );
};
