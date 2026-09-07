import React from 'react';
import { GlobalOceanControls } from '../components/GlobalOceanControls';
import { OceanViewport } from '../components/OceanViewport';
import { OceanMap } from '../components/panels/OceanMap';
import { SelectedInstrumentPanel } from '../components/panels/SelectedInstrumentPanel';
import { LayerControls } from '../components/panels/LayerControls';
import { AnalyticsPanel } from '../components/panels/AnalyticsPanel';
import { MonitoringPanel } from '../components/panels/MonitoringPanel';
import { VariableCards } from '../components/VariableCards';
import { FeatureGrid } from '../components/FeatureGrid';
import { DatasetSelector } from '../components/DatasetSelector';
import { ComparisonPanel } from '../components/panels/ComparisonPanel';
import { AnalyticsToolbar } from '../components/panels/AnalyticsToolbar';

export const Dashboard: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">

      {/* Top Controls */}
      <GlobalOceanControls />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side (Map + Instruments + Layers + Dataset) */}
        <div className="lg:col-span-3 lg:h-[600px] space-y-6 order-2 lg:order-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
          <DatasetSelector />
          <OceanMap />
          <SelectedInstrumentPanel />
          <LayerControls />
        </div>

        {/* Center (3D View) */}
        <div className="lg:col-span-6 h-[600px] flex flex-col order-1 lg:order-2 relative rounded-xl overflow-hidden border border-border/50 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <AnalyticsToolbar />
          <OceanViewport />
        </div>

        {/* Right Side (Analytics + Monitoring) */}
        <div className="lg:col-span-3 lg:h-[600px] order-3 lg:order-3 space-y-6 overflow-y-auto custom-scrollbar pr-2 pb-2">
          <AnalyticsPanel />
          <MonitoringPanel />
        </div>

      </div>

      {/* Variables */}
      <VariableCards />

      {/* Feature Grid */}
      <FeatureGrid />

      {/* Comparison Modal */}
      <ComparisonPanel />

    </div>
  );
};
