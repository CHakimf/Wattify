import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import { MonitoringData } from '../types';

interface Props {
  history: MonitoringData[];
}

type MetricType = 'voltage' | 'current' | 'power' | 'energy' | 'frequency' | 'pf' | 'wifi_rssi' | 'esp_temp' | 'free_heap';

export function LoadCurveChart({ history }: Props) {
  const [metric, setMetric] = useState<MetricType>('power');

  const data = useMemo(() => {
    // Initialize 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      name: `${i.toString().padStart(2, '0')}:00`,
      value: 0,
      count: 0
    }));

    history.forEach(d => {
      if (!d.timestamp) return;
      const date = new Date(d.timestamp);
      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        hours[hour].value += Number(d[metric]) || 0;
        hours[hour].count += 1;
      }
    });

    return hours.map(h => ({
      name: h.name,
      value: h.count > 0 ? Number((h.value / h.count).toFixed(2)) : 0,
    }));
  }, [history, metric]);

  if (history.length === 0) {
    return null;
  }

  const getUnit = () => {
    switch(metric) {
      case 'voltage': return 'V';
      case 'current': return 'A';
      case 'power': return 'W';
      case 'energy': return 'kWh';
      case 'frequency': return 'Hz';
      case 'pf': return '';
      case 'wifi_rssi': return 'dBm';
      case 'esp_temp': return '°C';
      case 'free_heap': return 'B';
      default: return '';
    }
  };

  const getLabel = () => {
    switch(metric) {
      case 'voltage': return 'Tegangan';
      case 'current': return 'Arus';
      case 'power': return 'Daya';
      case 'energy': return 'Energi';
      case 'frequency': return 'Frekuensi';
      case 'pf': return 'Power Factor';
      case 'wifi_rssi': return 'Sinyal WiFi';
      case 'esp_temp': return 'Suhu CPU';
      case 'free_heap': return 'Memori Bebas';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Load Curve {getLabel()} (24 Jam)
        </CardTitle>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as MetricType)}
          className="text-sm border rounded-md px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 outline-none cursor-pointer"
        >
          <option value="voltage">Tegangan (V)</option>
          <option value="current">Arus (A)</option>
          <option value="power">Daya (W)</option>
          <option value="energy">Energi (kWh)</option>
          <option value="frequency">Frekuensi (Hz)</option>
          <option value="pf">Power Factor</option>
          <option value="wifi_rssi">Sinyal WiFi (dBm)</option>
          <option value="esp_temp">Suhu CPU (°C)</option>
          <option value="free_heap">Memori Bebas (B)</option>
        </select>
      </CardHeader>
      <CardContent>
        {data.every(d => d.value === 0) ? (
          <div className="h-[350px] w-full flex items-center justify-center text-slate-500">
            Tidak ada data untuk ditampilkan
          </div>
        ) : (
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" dark:stroke="#334155" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value} ${getUnit()}`, `Rata-rata ${getLabel()}`]}
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
