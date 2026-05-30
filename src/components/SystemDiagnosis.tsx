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
    if (rssi === undefined || rssi === 0) return 'text-slate-400';
    if (rssi > -50) return 'text-green-500';
    if (rssi > -70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRssiLabel = (rssi: number | undefined) => {
    if (rssi === undefined || rssi === 0) return 'Terputus';
    if (rssi > -50) return 'Sangat Kuat';
    if (rssi > -70) return 'Cukup';
    return 'Lemah';
  };

  const diagnosisItems = [
    {
      label: 'Informasi Jaringan',
      value: data.ssid ? data.ssid : 'Tidak Terhubung',
      subValue: data.ip ? `IP: ${data.ip}` : 'Perangkat Offline',
      icon: Wifi,
      color: data.ssid ? 'text-blue-500' : 'text-slate-400'
    },
    {
      label: 'Kekuatan Sinyal WiFi',
      value: data.wifi_rssi && data.wifi_rssi !== 0 ? `${data.wifi_rssi} dBm` : 'Tidak Tersedia',
      subValue: data.wifi_rssi && data.wifi_rssi !== 0 
        ? (data.wifi_quality !== undefined ? `Kualitas: ${data.wifi_quality}% (${getRssiLabel(data.wifi_rssi)})` : getRssiLabel(data.wifi_rssi))
        : 'Perangkat Offline',
      icon: Wifi,
      color: getRssiColor(data.wifi_rssi)
    },
    {
      label: 'Waktu Aktif (Uptime)',
      value: (data.uptime_s && data.uptime_s > 0) ? (data.uptime_str || formatUptime(data.uptime_s)) : 'Tidak Tersedia',
      subValue: 'Durasi perangkat menyala',
      icon: Clock,
      color: (!data.uptime_s || data.uptime_s === 0) ? 'text-slate-400' : 'text-blue-500'
    },
    {
      label: 'Suhu Internal CPU',
      value: data.esp_temp && data.esp_temp !== 0 ? `${data.esp_temp.toFixed(1)} °C` : 'Tidak Tersedia',
      subValue: data.esp_temp && data.esp_temp !== 0 ? (data.esp_temp > 60 ? 'Peringatan: Suhu Tinggi' : 'Status: Normal') : 'Perangkat Offline',
      icon: Thermometer,
      color: data.esp_temp && data.esp_temp > 60 ? 'text-orange-500' : (!data.esp_temp || data.esp_temp === 0 ? 'text-slate-400' : 'text-cyan-500')
    },
    {
      label: 'Sisa Memori (Free Heap)',
      value: data.free_heap && data.free_heap !== 0 ? `${(data.free_heap / 1024).toFixed(1)} KB` : 'Tidak Tersedia',
      subValue: data.free_heap && data.free_heap !== 0 && data.heap_percent !== undefined ? `Tersisa: ${data.heap_percent}% dari total` : 'Perangkat Offline',
      icon: HardDrive,
      color: (!data.free_heap || data.free_heap === 0) ? 'text-slate-400' : 'text-purple-500'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
