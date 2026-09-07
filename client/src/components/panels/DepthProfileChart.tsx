import React, { useEffect, useState } from 'react';
import { useOceanStore } from '../../store/useOceanStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const DepthProfileChart: React.FC = () => {
  const { selectedVariable, selectedTime, activeDatasetId } = useOceanStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const timeIso = new Date(Date.now() + selectedTime * 3600000).toISOString();
        const dsId = activeDatasetId || 'incois_hoofs_indian_ocean';
        
        const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
        const res = await fetch(`${apiBase}/analytics/profile?datasetId=${dsId}&variable=${selectedVariable}&time=${encodeURIComponent(timeIso)}`);
        const result = await res.json();
        
        if (result && result.depths && result.values) {
          const chartData = result.depths.map((d: number, i: number) => ({
            depth: d,
            value: result.values[i]
          }));
          setData(chartData);
        }
      } catch (err) {
        console.error("Failed to fetch depth profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [selectedVariable, selectedTime, activeDatasetId]);

  const getUnit = () => {
    switch (selectedVariable) {
      case 'temperature': return '°C';
      case 'salinity': return 'PSU';
      case 'current':
      case 'currentVelocity': return 'm/s';
      case 'chlorophyll': return 'mg/m³';
      default: return '';
    }
  };

  const getLineColor = () => {
    switch (selectedVariable) {
      case 'temperature': return '#ff4b4b';
      case 'salinity': return '#00d4ff';
      case 'currentVelocity':
      case 'current': return '#a855f7';
      case 'chlorophyll': return '#22c55e';
      default: return '#00d4ff';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-[400px] flex items-center justify-center text-textSecondary">
        Loading profile data...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-1 min-h-[400px] flex items-center justify-center text-textSecondary">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[400px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis 
            type="number" 
            domain={['auto', 'auto']} 
            stroke="#888" 
            tick={{ fill: '#888' }} 
            label={{ value: `${selectedVariable.charAt(0).toUpperCase() + selectedVariable.slice(1)} (${getUnit()})`, position: 'bottom', fill: '#888' }} 
          />
          <YAxis 
            dataKey="depth" 
            type="number" 
            reversed 
            stroke="#888" 
            tick={{ fill: '#888' }} 
            label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft', fill: '#888' }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#111', borderColor: '#333' }}
            itemStyle={{ fontWeight: 'bold' }}
            formatter={(value: number) => [`${value.toFixed(2)} ${getUnit()}`, selectedVariable.toUpperCase()]}
            labelFormatter={(label: number) => `Depth: ${label}m`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={getLineColor()} 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#111', stroke: getLineColor(), strokeWidth: 2 }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
