import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Cpu, Wifi, Clock, HardDrive, Thermometer, Info } from 'lucide-react';
import { MonitoringData } from '../types';
import { motion } from 'motion/react';

interface Props {
  data: MonitoringData;
}

export function SystemDiagnosis({ data }: Props) {
  const formatUptime = (seconds: number | undefined) => {
    if (seconds === undefined) return '-';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  const getRssiColor = (rssi: number | undefined) => {
    if (rssi === undefined) return 'text-slate-400';
    if (rssi > -50) return 'text-green-500';
    if (rssi > -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRssiLabel = (rssi: number | undefined) => {
    if (rssi === undefined) return 'N/A';
    if (rssi > -50) return 'Sangat Kuat';
    if (rssi > -70) return 'Cukup';
    return 'Lemah';
  };

  const diagnosisItems = [
    {
      label: 'Sinyal WiFi (RSSI)',
      value: data.wifi_rssi !== undefined ? `${data.wifi_rssi} dBm` : '-',
      subValue: data.wifi_quality !== undefined ? `Kualitas: ${data.wifi_quality}%` : getRssiLabel(data.wifi_rssi),
      icon: Wifi,
      color: getRssiColor(data.wifi_rssi)
    },
    {
      label: 'Waktu Aktif (Uptime)',
      value: data.uptime_str || formatUptime(data.uptime_s),
      icon: Clock,
      color: 'text-blue-500'
    },
    {
      label: 'Suhu CPU ESP32',
      value: data.esp_temp !== undefined ? `${data.esp_temp.toFixed(1)} °C` : '-',
      icon: Thermometer,
      color: data.esp_temp && data.esp_temp > 60 ? 'text-orange-500' : 'text-cyan-500'
    },
    {
      label: 'Memori Bebas (Heap)',
      value: data.free_heap !== undefined ? `${(data.free_heap / 1024).toFixed(1)} KB` : '-',
      subValue: data.heap_percent !== undefined ? `Tersisa: ${data.heap_percent}%` : undefined,
      icon: HardDrive,
      color: 'text-purple-500'
    }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-slate-500" />
          Diagnosis Sistem ESP32
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {diagnosisItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className={`p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm ${item.color}`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.label}</div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">{item.value}</div>
                {item.subValue && <div className={`text-[10px] font-medium ${item.color}`}>{item.subValue}</div>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
