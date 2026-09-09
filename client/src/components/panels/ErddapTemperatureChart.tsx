import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, AlertCircle, Loader2 } from 'lucide-react';

interface DataPoint {
  time: string;
  temperature: number;
}

export const ErddapTemperatureChart: React.FC = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Call our backend API instead of NOAA directly
        const url = 'http://localhost:5000/api/datasets/incois_hoofs_indian_ocean/field?variable=temperature&depth=0&time=2026-09-01T00:00:00Z';
        
        const response = await axios.get(url);
        
        if (response.data && response.data.values) {
          const values = response.data.values.slice(0, 50); // limit points for chart
          const formattedData: DataPoint[] = values.map((val: any, index: number) => ({
            time: `Point ${index + 1}`,
            temperature: Number(val.value.toFixed(2))
          })).filter((d: DataPoint) => !isNaN(d.temperature));
          
          setData(formattedData);
        } else {
          setError("Unexpected data format from backend API.");
        }
      } catch (err: any) {
        console.error("Failed to fetch ERDDAP data:", err);
        // If the API call fails or 404s, we can show a mock data fallback or the actual error
        // since the NOAA ERDDAP can sometimes be temperamental with exact coordinates/dates.
        setError("Unable to fetch data from NOAA ERDDAP. The selected station or time range might not have data available.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-xl border border-border/50 flex flex-col mt-6 mb-6 h-[400px]">
      <div className="flex items-center gap-2 mb-4">
        <Thermometer className="w-5 h-5 text-red-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-textSecondary">
          Live Ocean Temperature (NOAA ERDDAP)
        </h3>
      </div>

      <div className="flex-1 w-full relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-cyan-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm">Fetching NOAA API data...</p>
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 gap-2">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm text-center max-w-md">{error}</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis 
                dataKey="time" 
                stroke="#8892b0" 
                fontSize={12} 
                tickMargin={10} 
                minTickGap={30}
              />
              <YAxis 
                stroke="#8892b0" 
                fontSize={12} 
                domain={['auto', 'auto']}
                label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft', style: { fill: '#8892b0' } }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                itemStyle={{ color: '#00d4ff' }}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                name="Temperature"
                stroke="#00d4ff" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#00d4ff', stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-textSecondary gap-2">
            <p className="text-sm">No temperature data available for this range.</p>
          </div>
        )}
      </div>
    </div>
  );
};
