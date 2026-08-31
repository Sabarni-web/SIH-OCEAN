import React from 'react';
import { Database, Globe, Server, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const activeProvider = import.meta.env.VITE_DATA_PROVIDER || 'INCOIS';
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const erddapUrl = import.meta.env.VITE_INCOIS_ERDDAP_URL || 'https://erddap.incois.gov.in/erddap';

  return (
    <div className="max-w-[1200px] mx-auto w-full animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Settings & Provider Configuration</h1>
      
      <div className="space-y-6">
        {/* Active Provider Card */}
        <div className="p-6 rounded-xl border border-border/50 bg-surface/50 backdrop-blur-md space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Globe className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-white">Active Oceanographic Data Provider</h2>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {activeProvider}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-surface/30 rounded-lg border border-border/30 space-y-1">
                <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">Configured Provider</p>
                <p className="text-base font-bold text-white">{activeProvider}</p>
                <p className="text-xs text-textSecondary">Indian National Centre for Ocean Information Services</p>
              </div>

              <div className="p-4 bg-surface/30 rounded-lg border border-border/30 space-y-1">
                <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">ERDDAP Base Service</p>
                <p className="text-sm font-mono text-cyan-300 break-all">{erddapUrl}</p>
                <p className="text-xs text-textSecondary">RESTful Open Access Protocol</p>
              </div>
            </div>
          </section>

          {/* Backend API Service */}
          <section className="pt-4 border-t border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Backend Aggregation API</h2>
            </div>
            <div className="p-4 bg-surface/30 rounded-lg border border-border/30 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">API Gateway Endpoint</p>
                <p className="text-xs font-mono text-cyan-300">{apiBaseUrl}</p>
              </div>
              <span className="px-2.5 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded text-xs font-semibold">
                CONNECTED
              </span>
            </div>
          </section>

          {/* Storage Information */}
          <section className="pt-4 border-t border-border/30">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-white">Database & Persistence</h2>
            </div>
            <div className="p-4 bg-surface/30 rounded-lg border border-border/30 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">MongoDB Ingestion Cache</p>
                <p className="text-xs text-textSecondary">Configurable via <code className="text-cyan-300">MONGO_URI</code> in <code className="text-cyan-300">.env</code> (auto-falls back to live API mode if offline).</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-semibold">
                ACTIVE
              </span>
            </div>
          </section>
        </div>

        {/* Switching Provider Instructions */}
        <div className="p-6 rounded-xl border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md space-y-3">
          <h3 className="text-base font-semibold text-cyan-300">How to Switch Providers</h3>
          <p className="text-sm text-textSecondary leading-relaxed">
            To switch data providers or endpoints, open the root <code className="text-white bg-black/40 px-1.5 py-0.5 rounded border border-border">.env</code> file and change <code className="text-cyan-300">DATA_PROVIDER</code> or the respective API URLs. Changes take effect automatically upon saving.
          </p>
        </div>
      </div>
    </div>
  );
};
