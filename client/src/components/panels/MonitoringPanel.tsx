import React, { useEffect } from 'react';
import { Activity, AlertTriangle, Info, CheckCircle2, RefreshCw } from 'lucide-react';
import { useMonitoringStore } from '../../store/useMonitoringStore';

export const MonitoringPanel: React.FC = () => {
  const { systemStatus, lastUpdated, alerts, fetchMonitoringData, acknowledgeAlert } = useMonitoringStore();

  useEffect(() => {
    // Initial fetch
    fetchMonitoringData();
    // Poll every 15 seconds
    const interval = setInterval(fetchMonitoringData, 15000);
    return () => clearInterval(interval);
  }, [fetchMonitoringData]);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');

  return (
    <div className="glass-panel p-4 rounded-xl h-full flex flex-col gap-4 overflow-hidden">
      
      {/* Top Bar / Status */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">Operational Status</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase flex items-center gap-1
            ${systemStatus === 'LIVE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
              systemStatus === 'DEMO' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 
              'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            <span className={`w-2 h-2 rounded-full ${systemStatus === 'LIVE' ? 'bg-green-400 animate-pulse' : systemStatus === 'DEMO' ? 'bg-orange-400' : 'bg-red-400'}`}></span>
            {systemStatus}
          </div>
        </div>
      </div>

      <div className="text-xs text-textSecondary flex items-center gap-1 justify-end">
        <RefreshCw className="w-3 h-3" /> Last Updated: {new Date(lastUpdated).toLocaleTimeString()}
      </div>

      {/* Alert Feed */}
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2 sticky top-0 bg-background/90 py-1 backdrop-blur-sm z-10">
          Active Alerts ({activeAlerts.length})
        </h3>
        
        {activeAlerts.length === 0 ? (
          <div className="text-center py-10 text-textSecondary flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-green-500/50" />
            <span className="text-sm">All systems nominal</span>
          </div>
        ) : (
          activeAlerts.map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg border flex flex-col gap-2 
              ${alert.severity === 'CRITICAL' ? 'bg-red-900/20 border-red-900/50' : 
                alert.severity === 'WARNING' ? 'bg-orange-900/20 border-orange-900/50' : 
                'bg-blue-900/20 border-blue-900/50'}`}>
              
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {alert.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                   alert.severity === 'WARNING' ? <AlertTriangle className="w-4 h-4 text-orange-400" /> :
                   <Info className="w-4 h-4 text-blue-400" />}
                  <span className={`text-xs font-bold uppercase tracking-wider 
                    ${alert.severity === 'CRITICAL' ? 'text-red-400' : alert.severity === 'WARNING' ? 'text-orange-400' : 'text-blue-400'}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-[10px] text-textSecondary">{new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
              
              <p className="text-sm text-white font-medium">{alert.message}</p>
              
              {alert.location && (
                <p className="text-xs text-textSecondary">
                  Loc: {alert.location.lat.toFixed(2)}°N, {alert.location.lon.toFixed(2)}°E
                </p>
              )}

              <div className="flex justify-end mt-1">
                <button 
                  onClick={() => acknowledgeAlert(alert.id)}
                  className="text-xs bg-surfaceElevated hover:bg-surfaceLight px-2 py-1 rounded text-textSecondary hover:text-white transition-colors"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
