import React from 'react';

export const MooringsPage: React.FC = () => {
  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Moorings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4">Mooring Stations</h2>
          {/* Data grid will go here */}
        </div>
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md">
            <h2 className="text-xl font-semibold mb-4">Station Details</h2>
          </div>
        </div>
      </div>
    </div>
  );
};
