import React, { useState } from 'react';
import { Navigation, ArrowRight, X } from 'lucide-react';
import { useObservationStore } from '../../store/useObservationStore';
import type { ArgoFloat, Glider, CTDObservation, Mooring, BGCObservation } from '../../../../shared/types';
import { ObservationProfile } from './ObservationProfile';
import { useComparisonStore } from '../../store/useComparisonStore';

export const SelectedInstrumentPanel: React.FC = () => {
  const { selectedObservation, selectObservation } = useObservationStore();
  const [showProfile, setShowProfile] = useState(false);

  if (!selectedObservation) {
    return (
      <div className="glass-panel p-4 rounded-xl flex items-center justify-center text-textSecondary h-48">
        No instrument selected
      </div>
    );
  }

  const renderDetails = () => {
    switch (selectedObservation.type) {
      case 'argo':
        const argo = selectedObservation as ArgoFloat;
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-textSecondary mb-1">Float ID</p>
                <p className="text-lg font-bold text-white">{argo.wmoId}</p>
              </div>
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {argo.status}
              </div>
            </div>
          </>
        );
      case 'glider':
        const glider = selectedObservation as Glider;
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-textSecondary mb-1">Glider ID</p>
                <p className="text-lg font-bold text-white">{glider.deploymentId}</p>
              </div>
              <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {glider.status}
              </div>
            </div>
          </>
        );
      case 'ctd':
        const ctd = selectedObservation as CTDObservation;
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-textSecondary mb-1">Cruise ID</p>
                <p className="text-lg font-bold text-white">{ctd.cruiseId}</p>
              </div>
              <div className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {ctd.status}
              </div>
            </div>
          </>
        );
      case 'mooring':
        const mooring = selectedObservation as Mooring;
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-textSecondary mb-1">Station ID</p>
                <p className="text-lg font-bold text-white">{mooring.stationId}</p>
              </div>
              <div className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {mooring.status}
              </div>
            </div>
          </>
        );
      case 'bgc':
        const bgc = selectedObservation as BGCObservation;
        return (
          <>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-textSecondary mb-1">Platform</p>
                <p className="text-lg font-bold text-white">{bgc.platformType}</p>
              </div>
              <div className="bg-teal-500/20 text-teal-400 border border-teal-500/30 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                {bgc.status}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="glass-panel p-4 rounded-xl relative">
        <button 
          className="absolute top-2 right-2 text-textSecondary hover:text-white"
          onClick={() => selectObservation(null)}
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">
            Selected {selectedObservation.type}
          </h3>
        </div>
        
        <div className="space-y-4">
          {renderDetails()}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-textSecondary mb-1">Location</p>
              <p className="text-sm font-medium text-white">{selectedObservation.latitude.toFixed(2)}° N<br/>{selectedObservation.longitude.toFixed(2)}° E</p>
            </div>
            <div>
              <p className="text-xs text-textSecondary mb-1">Timestamp</p>
              <p className="text-sm font-medium text-white">{new Date(selectedObservation.timestamp).toLocaleDateString()}<br/>{new Date(selectedObservation.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center bg-surfaceElevated p-2 rounded-md border border-border/50">
            <span className="text-xs text-textSecondary">Depth</span>
            <span className="text-sm font-bold text-primary">{selectedObservation.depth.toFixed(1)} m</span>
          </div>

          {selectedObservation.variables.temperature !== undefined && (
            <div className="flex justify-between items-center bg-surfaceElevated p-2 rounded-md border border-border/50">
              <span className="text-xs text-textSecondary">Temperature</span>
              <span className="text-sm font-bold text-primary">{selectedObservation.variables.temperature.toFixed(1)} °C</span>
            </div>
          )}

          <div className="flex gap-2 mt-2">
            <button 
              className="flex-1 btn-outline flex items-center justify-center gap-2 text-sm"
              onClick={() => setShowProfile(true)}
            >
              View Full Profile
            </button>
            <button 
              className="flex-1 bg-primary text-black font-bold flex items-center justify-center gap-2 text-sm rounded transition-all hover:bg-primary/90"
              onClick={() => {
                useComparisonStore.getState().setSelectedObservationId(selectedObservation.id);
                useComparisonStore.getState().setIsComparisonOpen(true);
              }}
            >
              Compare
            </button>
          </div>
        </div>
      </div>
      
      {showProfile && (
        <ObservationProfile 
          observation={selectedObservation} 
          onClose={() => setShowProfile(false)} 
        />
      )}
    </>
  );
};
