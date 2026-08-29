import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useComparisonStore } from '../../store/useComparisonStore';
import { useOceanStore } from '../../store/useOceanStore';
import { datasetService } from '../../services/api';

export const ComparisonPanel: React.FC = () => {
  const { isComparisonOpen, setIsComparisonOpen, selectedObservationId, spatialTolerance, setSpatialTolerance, depthTolerance, setDepthTolerance } = useComparisonStore();
  const { activeDatasetId, selectedVariable } = useOceanStore();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isComparisonOpen || !selectedObservationId) return;

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const dsId = activeDatasetId || 'demo_model'; // Fallback for prototype
        const res = await datasetService.getComparisonProfile(dsId, selectedObservationId, selectedVariable);
        
        // Transform for Recharts
        const chartData = res.depths.map((d: number, i: number) => ({
          depth: d,
          model: res.modelProfile[i],
          observation: res.observationProfile[i]
        }));
        
        setData({
          chartData,
          statistics: res.statistics,
          spatialDistance: res.spatialDistance
        });
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [isComparisonOpen, selectedObservationId, activeDatasetId, selectedVariable, spatialTolerance, depthTolerance]);

  if (!isComparisonOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-border/50 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-white">Model vs Observation Analysis</h2>
          </div>
          <button onClick={() => setIsComparisonOpen(false)} className="text-textSecondary hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-6">
          {error ? (
            <div className="bg-red-900/20 text-red-400 p-4 rounded-lg border border-red-900/50 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-textSecondary gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              Processing nearest-neighbor matching...
            </div>
          ) : data ? (
            <>
              {/* Settings & Tolerances */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surfaceElevated p-3 rounded-lg border border-border/50">
                  <span className="text-[10px] text-textSecondary uppercase block mb-1">Spatial Tolerance</span>
                  <input type="number" value={spatialTolerance} onChange={e => setSpatialTolerance(Number(e.target.value))} className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-white" />
                </div>
                <div className="bg-surfaceElevated p-3 rounded-lg border border-border/50">
                  <span className="text-[10px] text-textSecondary uppercase block mb-1">Depth Tolerance</span>
                  <input type="number" value={depthTolerance} onChange={e => setDepthTolerance(Number(e.target.value))} className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-white" />
                </div>
                <div className="col-span-2 bg-surfaceElevated p-3 rounded-lg border border-border/50">
                  <span className="text-[10px] text-textSecondary uppercase block mb-1">Spatial Match Distance</span>
                  <div className="text-lg font-bold text-white">{data.spatialDistance}</div>
                </div>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-xs text-textSecondary uppercase tracking-wider block mb-2">Matched Points</span>
                  <span className="text-2xl font-bold text-white">{data.statistics.matchedPoints}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-xs text-textSecondary uppercase tracking-wider block mb-2">Bias</span>
                  <span className={`text-2xl font-bold ${data.statistics.bias > 0 ? 'text-red-400' : 'text-blue-400'}`}>
                    {data.statistics.bias > 0 ? '+' : ''}{data.statistics.bias.toFixed(2)}
                  </span>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-xs text-textSecondary uppercase tracking-wider block mb-2">RMSE</span>
                  <span className="text-2xl font-bold text-orange-400">{data.statistics.rmse.toFixed(2)}</span>
                </div>
                <div className="glass-panel p-4 rounded-xl text-center">
                  <span className="text-xs text-textSecondary uppercase tracking-wider block mb-2">Correlation</span>
                  <span className="text-2xl font-bold text-green-400">{data.statistics.correlation.toFixed(2)}</span>
                </div>
              </div>

              {/* Profile Chart */}
              <div className="glass-panel p-4 rounded-xl flex-1 min-h-[400px]">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary mb-4">Depth Profile Comparison ({selectedVariable})</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data.chartData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis type="number" domain={['auto', 'auto']} stroke="#888" tick={{ fill: '#888' }} />
                    <YAxis dataKey="depth" type="number" reversed stroke="#888" tick={{ fill: '#888' }} label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="model" name="Model" stroke="#00d4ff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="observation" name="Observation" stroke="#ff00d4" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
