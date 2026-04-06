import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Download, History, Trash2 } from 'lucide-react';
import { MonitoringData } from '../types';
import { format } from 'date-fns';

interface Props {
  history: MonitoringData[];
  onClearHistory?: () => void;
}

export function DataHistory({ history, onClearHistory }: Props) {
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

  // Show only last 10 items in the table
  const displayHistory = [...history].reverse().slice(0, 10);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Riwayat Data (Sesi Ini)
        </CardTitle>
        <div className="flex items-center gap-2">
          {onClearHistory && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
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
      <CardContent>
        <div className="overflow-x-auto">
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
                  <tr key={i} className="border-b dark:border-slate-800 last:border-0">
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
      </CardContent>
    </Card>
  );
}
