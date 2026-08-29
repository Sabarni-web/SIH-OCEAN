import { create } from 'zustand';

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  location?: { lat: number; lon: number };
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
}

interface MonitoringState {
  systemStatus: 'LIVE' | 'DEMO' | 'OFFLINE';
  lastUpdated: string;
  alerts: Alert[];
  fetchMonitoringData: () => Promise<void>;
  acknowledgeAlert: (id: string) => Promise<void>;
}

export const useMonitoringStore = create<MonitoringState>((set) => ({
  systemStatus: 'DEMO',
  lastUpdated: new Date().toISOString(),
  alerts: [],
  
  fetchMonitoringData: async () => {
    try {
      const [statusRes, alertsRes] = await Promise.all([
        fetch('http://localhost:5000/api/alerts/status'),
        fetch('http://localhost:5000/api/alerts')
      ]);
      
      const statusData = await statusRes.json();
      const alertsData = await alertsRes.json();
      
      set({ 
        systemStatus: statusData.status || 'DEMO', 
        lastUpdated: statusData.lastUpdated,
        alerts: alertsData 
      });
    } catch (e) {
      set({ systemStatus: 'OFFLINE' });
    }
  },

  acknowledgeAlert: async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}/acknowledge`, { method: 'POST' });
      // Update local state directly for speed
      set(state => ({
        alerts: state.alerts.map(a => a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)
      }));
    } catch (e) {
      console.error('Failed to acknowledge alert', e);
    }
  }
}));
