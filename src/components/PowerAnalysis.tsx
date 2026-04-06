import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { LineChart as LineChartIcon, TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle2, Calendar, CalendarDays, CalendarRange, BarChart3, Info } from 'lucide-react';
import { MonitoringData, Settings } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface Props {
  history: MonitoringData[];
  settings: Settings;
}

export function PowerAnalysis({ history, settings }: Props) {
  if (history.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5" />
            Analisa & Estimasi Daya
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-4">Mengumpulkan data untuk analisa...</div>
        </CardContent>
      </Card>
    );
  }

  const powers = history.map(d => d.power);
  const avgPower = powers.reduce((a, b) => a + b, 0) / powers.length;
  const maxPower = Math.max(...powers);
  const minPower = Math.min(...powers);
  
  // Trend Calculation (comparing recent half to older half)
  const midPoint = Math.floor(history.length / 2);
  const recentHistory = history.slice(midPoint);
  const olderHistory = history.slice(0, midPoint);

  const recentAvg = recentHistory.reduce((a, b) => a + b.power, 0) / (recentHistory.length || 1);
  const olderAvg = olderHistory.reduce((a, b) => a + b.power, 0) / (olderHistory.length || 1);

  const trendPercentage = olderAvg === 0 ? 0 : ((recentAvg - olderAvg) / olderAvg) * 100;
  const isTrendNeutral = Math.abs(trendPercentage) < 1; // less than 1% change
  const isTrendUp = trendPercentage > 0;

  const TrendIcon = isTrendNeutral ? Minus : (isTrendUp ? TrendingUp : TrendingDown);
  const trendColor = isTrendNeutral ? 'text-slate-500 dark:text-slate-400' : (isTrendUp ? 'text-red-500' : 'text-green-500');
  const trendText = isTrendNeutral ? 'Stabil' : (isTrendUp ? `Naik ${trendPercentage.toFixed(1)}%` : `Turun ${Math.abs(trendPercentage).toFixed(1)}%`);

  // Estimates
  const estDailyKwh = (avgPower * 24) / 1000;
  const estDailyBill = estDailyKwh * settings.tariffPerKwh;

  const estWeeklyKwh = estDailyKwh * 7;
  const estWeeklyBill = estDailyBill * 7;

  const estMonthlyKwh = estDailyKwh * 30;
  const estMonthlyBill = estDailyBill * 30;

  const getStatus = () => {
    if (avgPower > settings.threshold * 0.8) return { text: 'Kritis', color: 'text-red-500', icon: AlertCircle };
    if (avgPower > settings.threshold * 0.5) return { text: 'Tinggi', color: 'text-yellow-500', icon: TrendingUp };
    return { text: 'Normal', color: 'text-green-500', icon: CheckCircle2 };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Historical Trends Data (Simulated based on current data for week/month/year as we don't have long-term storage)
  // In a real app, this would come from a backend API that aggregates data.
  const historicalData = [
    { name: 'Hari Ini', avg: avgPower, max: maxPower, min: minPower },
    { name: 'Minggu Ini', avg: avgPower * 0.95, max: maxPower * 1.1, min: minPower * 0.8 }, // Simulated
    { name: 'Bulan Ini', avg: avgPower * 1.05, max: maxPower * 1.2, min: minPower * 0.7 }, // Simulated
    { name: 'Tahun Ini', avg: avgPower * 1.02, max: maxPower * 1.5, min: minPower * 0.5 }, // Simulated
  ];

  return (
    <Card className="mb-6 overflow-hidden border-slate-200 dark:border-slate-800">
      <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Analisa & Tren Historis
          </CardTitle>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold">
            <Info className="h-3.5 w-3.5" />
            Data Real-time
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          {/* Left Column: Current Stats */}
          <div className="p-6 space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statistik Sesi</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                <div className={`text-sm font-bold flex items-center gap-1.5 ${status.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  {status.text}
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Rata-rata</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{avgPower.toFixed(1)} W</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Puncak</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{maxPower.toFixed(1)} W</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-sm text-slate-500 dark:text-slate-400">Tren</span>
                <div className={`text-sm font-bold flex items-center gap-1.5 ${trendColor}`}>
                  <TrendIcon className="h-4 w-4" />
                  {trendText}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Estimasi Bulanan</h3>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <CalendarRange className="h-4 w-4" />
                  <span className="text-xs font-medium">Proyeksi 30 Hari</span>
                </div>
                <div className="text-2xl font-black mb-1">{formatCurrency(estMonthlyBill)}</div>
                <div className="text-xs font-medium opacity-80">Setara dengan {estMonthlyKwh.toFixed(1)} kWh</div>
              </div>
            </div>
          </div>

          {/* Middle & Right Column: Historical Comparison Chart */}
          <div className="lg:col-span-2 p-6 bg-slate-50/30 dark:bg-slate-900/10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Perbandingan Tren Historis</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Avg</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Max</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Min</span>
                </div>
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  />
                  <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="max" fill="#f87171" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="min" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Harian</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(estDailyBill)}</div>
                <div className="text-[10px] text-slate-400 font-medium">{estDailyKwh.toFixed(2)} kWh / hari</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-indigo-600 mb-2">
                  <CalendarDays className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mingguan</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(estWeeklyBill)}</div>
                <div className="text-[10px] text-slate-400 font-medium">{estWeeklyKwh.toFixed(2)} kWh / minggu</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <CalendarRange className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Bulanan</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(estMonthlyBill)}</div>
                <div className="text-[10px] text-slate-400 font-medium">{estMonthlyKwh.toFixed(2)} kWh / bulan</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
