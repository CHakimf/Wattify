import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CalendarDays } from 'lucide-react';
import { MonitoringData } from '../types';
import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

interface Props {
  history: MonitoringData[];
}

type GroupBy = 'day' | 'week' | 'month' | 'year';

export function HistoryTrendChart({ history }: Props) {
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  const data = useMemo(() => {
    if (history.length === 0) return [];

    const grouped = new Map<string, {
      timestamp: number;
      maxPower: number;
      minPower: number;
      sumPower: number;
      maxEnergy: number;
      minEnergy: number;
      count: number;
    }>();

    history.forEach(d => {
      if (!d.timestamp) return;
      
      const date = new Date(d.timestamp);
      let groupKey = '';
      let groupTimestamp = 0;

      if (groupBy === 'day') {
        const start = startOfDay(date);
        groupKey = format(start, 'yyyy-MM-dd');
        groupTimestamp = start.getTime();
      } else if (groupBy === 'week') {
        const start = startOfWeek(date, { weekStartsOn: 1 });
        groupKey = format(start, 'yyyy-MM-dd');
        groupTimestamp = start.getTime();
      } else if (groupBy === 'month') {
        const start = startOfMonth(date);
        groupKey = format(start, 'yyyy-MM');
        groupTimestamp = start.getTime();
      } else if (groupBy === 'year') {
        const start = new Date(date.getFullYear(), 0, 1);
        groupKey = format(start, 'yyyy');
        groupTimestamp = start.getTime();
      }

      const existing = grouped.get(groupKey);
      if (existing) {
        existing.maxPower = Math.max(existing.maxPower, d.power);
        existing.minPower = Math.min(existing.minPower, d.power);
        existing.sumPower += d.power;
        existing.maxEnergy = Math.max(existing.maxEnergy, d.energy || 0);
        existing.minEnergy = Math.min(existing.minEnergy, d.energy || 0);
        existing.count += 1;
      } else {
        grouped.set(groupKey, {
          timestamp: groupTimestamp,
          maxPower: d.power,
          minPower: d.power,
          sumPower: d.power,
          maxEnergy: d.energy || 0,
          minEnergy: d.energy || 0,
          count: 1
        });
      }
    });

    return Array.from(grouped.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(item => ({
        ...item,
        avgPower: Number((item.sumPower / item.count).toFixed(1)),
        maxPower: Number(item.maxPower.toFixed(1)),
        minPower: Number(item.minPower.toFixed(1)),
        energyConsumed: Number((item.maxEnergy - item.minEnergy).toFixed(2)),
        label: groupBy === 'day' 
          ? format(new Date(item.timestamp), 'dd MMM', { locale: id })
          : groupBy === 'week'
            ? `Minggu ${format(new Date(item.timestamp), 'dd MMM', { locale: id })}`
            : groupBy === 'month'
              ? format(new Date(item.timestamp), 'MMM yyyy', { locale: id })
              : format(new Date(item.timestamp), 'yyyy', { locale: id })
      }));
  }, [history, groupBy]);

  if (history.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Tren Daya (Max, Min, Rata-rata)
        </CardTitle>
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="text-sm border rounded-md px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 outline-none cursor-pointer"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
            <option value="year">Tahunan</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[350px] w-full flex items-center justify-center text-slate-500">
            Tidak ada data untuk ditampilkan
          </div>
        ) : (
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{ 
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'Konsumsi Energi') return [`${value} kWh`, name];
                    return [`${value} W`, name];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="maxPower" name="Daya Maksimum" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgPower" name="Daya Rata-rata" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="minPower" name="Daya Minimum" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="energyConsumed" name="Konsumsi Energi" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
