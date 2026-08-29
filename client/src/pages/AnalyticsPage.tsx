import React from 'react';
import { AnalyticsPanel } from '../components/panels/AnalyticsPanel';
import { AnalyticsToolbar } from '../components/panels/AnalyticsToolbar';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Ocean Analytics</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1 p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md space-y-6">
          <AnalyticsToolbar />
          <AnalyticsPanel />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md">
            <h2 className="text-xl font-semibold mb-4">Depth Profile</h2>
            {/* Chart will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};
