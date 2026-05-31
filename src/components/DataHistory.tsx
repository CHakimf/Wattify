import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Download, History, Trash2, Zap, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { MonitoringData } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface Props {
  history: MonitoringData[];
  onClearHistory?: () => void;
  onResetData?: () => void;
}

export function DataHistory({ history, onClearHistory, onResetData }: Props) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(history.length / itemsPerPage);

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Waktu', 'Tegangan (V)', 'Arus (A)', 'Daya (W)', 'Energi (kWh)', 'Frekuensi (Hz)', 'PF', 'RSSI (dBm)', 'WiFi Quality (%)', 'Uptime (s)', 'Uptime Str', 'CPU Temp (°C)', 'Free Heap (B)', 'Heap (%)'];
    const csvContent = [
      headers.join(','),
      ...history.map(row => {
        const time = row.timestamp ? format(new Date(row.timestamp), 'yyyy-MM-dd HH:mm:ss') : '';
        const freq = row.frequency !== undefined ? row.frequency : 0;
        const pf = row.pf !== undefined ? row.pf : 0;
        const rssi = row.wifi_rssi !== undefined ? row.wifi_rssi : '';
        const quality = row.wifi_quality !== undefined ? row.wifi_quality : '';
        const uptime = row.uptime_s !== undefined ? row.uptime_s : '';
        const uptimeStr = row.uptime_str !== undefined ? row.uptime_str : '';
        const cpu = row.esp_temp !== undefined ? row.esp_temp : '';
        const heap = row.free_heap !== undefined ? row.free_heap : '';
        const heapPercent = row.heap_percent !== undefined ? row.heap_percent : '';
        return `${time},${row.voltage},${row.current},${row.power},${row.energy},${freq},${pf},${rssi},${quality},${uptime},"${uptimeStr}",${cpu},${heap},${heapPercent}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `esp32_power_history_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayHistory = useMemo(() => {
    const reversed = [...history].reverse();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reversed.slice(startIndex, startIndex + itemsPerPage);
  }, [history, currentPage]);

  // Group by day and calculate total energy per day
  const dailyEnergyData = useMemo(() => {
    if (history.length === 0) return [];
    
    const groups: { [key: string]: { first: number, last: number } } = {};
    
    // Assume energy is cumulative. For each day, the consumption is (last entry - first entry).
    // Or if energy is just the value in the day, calculate difference.
    history.forEach(data => {
      if (!data.timestamp || typeof data.energy !== 'number') return;
      const dateStr = format(new Date(data.timestamp), 'dd MMM yyyy');
      
      if (!groups[dateStr]) {
        groups[dateStr] = { first: data.energy, last: data.energy };
      } else {
        if (data.energy < groups[dateStr].first) groups[dateStr].first = data.energy;
        if (data.energy > groups[dateStr].last) groups[dateStr].last = data.energy;
      }
    });

    return Object.keys(groups).map(date => {
      const consumption = Math.max(0, groups[date].last - groups[date].first);
      return {
        date,
        kwh: Number(consumption.toFixed(3))
      };
    });
  }, [history]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b dark:border-slate-800 pb-4">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Data (Sesi Ini)
        </CardTitle>
        <div className="flex items-center gap-2">
          {onResetData && (
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-md transition-colors dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/40"
            >
              <RefreshCw className="h-4 w-4" />
              Mulai Baru
            </button>
          )}
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Waktu</th>
                <th className="px-4 py-3">Tegangan</th>
                <th className="px-4 py-3">Arus</th>
                <th className="px-4 py-3">Daya</th>
                <th className="px-4 py-3">Energi</th>
                <th className="px-4 py-3">Frekuensi</th>
                <th className="px-4 py-3 rounded-tr-lg">PF</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                     Belum ada data
                  </td>
                </tr>
              ) : (
                displayHistory.map((row, i) => (
                  <tr key={i} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium">
                      {row.timestamp ? format(new Date(row.timestamp), 'HH:mm:ss') : '-'}
                    </td>
                    <td className="px-4 py-3">{row.voltage.toFixed(1)} V</td>
                    <td className="px-4 py-3">{row.current.toFixed(2)} A</td>
                    <td className="px-4 py-3">{row.power.toFixed(1)} W</td>
                    <td className="px-4 py-3">{row.energy.toFixed(3)} kWh</td>
                    <td className="px-4 py-3">{row.frequency !== undefined ? row.frequency.toFixed(2) : '0.00'} Hz</td>
                    <td className="px-4 py-3">{row.pf !== undefined ? row.pf.toFixed(2) : '0.00'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {history.length > itemsPerPage && (
          <div className="flex items-center justify-between px-2 py-3 mb-6 text-sm text-slate-500 dark:text-slate-400">
            <div>
              Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, history.length)} dari {history.length} data
            </div>
            <div className="flex items-center gap-1 border dark:border-slate-800 rounded-lg p-1 bg-slate-50 dark:bg-slate-800/30">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="px-3 font-medium text-slate-700 dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman Selanjutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {dailyEnergyData.length > 0 && (
          <div className="mt-8 pt-6 border-t dark:border-slate-800">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
              <Zap className="h-4 w-4 text-amber-500" />
              Total Energi Harian (kWh)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyEnergyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} kWh`, 'Energi Konsumsi']}
                    labelStyle={{ color: '#475569', fontWeight: 600, marginBottom: '4px' }}
                  />
                  <Bar 
                    dataKey="kwh" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>

      {/* Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Mulai Sesi Baru?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Aksi ini akan menghapus semua <strong>Riwayat Grafik</strong> dan <strong>Mereset Meteran Energi (kWh)</strong> kembali ke 0. Data yang dihapus tidak dapat dikembalikan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (onResetData) onResetData();
                  setIsResetModalOpen(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
              >
                Ya, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
