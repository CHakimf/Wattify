import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { BarChart3, Clock, Zap, Battery, Activity, Database, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { MonitoringData, Settings } from '../types';

interface Props {
  history: MonitoringData[];
  settings: Settings;
}

export function UsageStatistics({ history, settings }: Props) {
  if (history.length === 0) {
    return null;
  }

  // Calculate statistics
  const dataPoints = history.length;
  const firstData = history[0];
  const lastData = history[history.length - 1];
  
  // Duration in minutes
  const durationMs = (lastData.timestamp || 0) - (firstData.timestamp || 0);
  const durationMinutes = Math.max(0, Math.floor(durationMs / 60000));
  const durationHours = Math.floor(durationMinutes / 60);
  const durationMins = durationMinutes % 60;
  const durationText = durationHours > 0 ? `${durationHours}j ${durationMins}m` : `${durationMins}m`;

  // Energy consumed in this session
  const energyConsumed = Math.max(0, lastData.energy - firstData.energy);
  
  // Cost for this session
  const sessionCost = energyConsumed * settings.tariffPerKwh;

  // Power Stats
  let maxPower = 0;
  let minPower = Infinity;
  let sumPower = 0;
  let overloadCount = 0;
  let isCurrentlyOverloaded = false;

  history.forEach(d => {
    if (d.power > maxPower) maxPower = d.power;
    if (d.power < minPower) minPower = d.power;
    sumPower += d.power;

    // Count overload events (transition from normal to overload)
    if (d.power > settings.threshold) {
      if (!isCurrentlyOverloaded) {
        overloadCount++;
        isCurrentlyOverloaded = true;
      }
    } else {
      isCurrentlyOverloaded = false;
    }
  });

  if (minPower === Infinity) minPower = 0;
  const avgPower = sumPower / dataPoints;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Statistik Penggunaan Sesi Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-md text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Durasi Sesi</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{durationText}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-md text-green-600 dark:text-green-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Energi Terpakai</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{energyConsumed.toFixed(4)} kWh</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
            <div className="p-2 bg-amber-100 dark:bg-amber-800/50 rounded-md text-amber-600 dark:text-amber-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Rata-rata Daya</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{avgPower.toFixed(1)} W</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50">
            <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-md text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Kejadian Overload</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{overloadCount} kali</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-md text-purple-600 dark:text-purple-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Daya Maksimum</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{maxPower.toFixed(1)} W</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-800/50">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-800/50 rounded-md text-cyan-600 dark:text-cyan-400">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Daya Minimum</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{minPower.toFixed(1)} W</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-800/50 rounded-md text-emerald-600 dark:text-emerald-400">
              <Battery className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Biaya Sesi</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">
                {sessionCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-300">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Titik Data</div>
              <div className="font-semibold text-slate-700 dark:text-slate-200">{dataPoints}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
