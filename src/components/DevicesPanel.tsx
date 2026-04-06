import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Cpu, Save, Server, Check, Clock, RefreshCw, Info, Power, Globe, ShieldCheck } from 'lucide-react';
import { Settings, RelayControl, MonitoringData } from '../types';
import { format } from 'date-fns';

interface Props {
  settings: Settings;
  relays: RelayControl;
  monitoring: MonitoringData;
  isDeviceOnline: boolean;
  lastSync: number | null;
  onSave: (settings: Partial<Settings>) => void;
  onSyncTime: () => void;
  onReboot: () => void;
}

export function DevicesPanel({ settings, relays, monitoring, isDeviceOnline, lastSync, onSave, onSyncTime, onReboot }: Props) {
  const [names, setNames] = useState(settings.relayNames);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);

  useEffect(() => {
    setNames(settings.relayNames);
  }, [settings.relayNames]);

  const handleSave = () => {
    onSave({ relayNames: names });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSync = () => {
    setIsSyncing(true);
    onSyncTime();
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleReboot = () => {
    if (window.confirm('Apakah Anda yakin ingin me-reboot perangkat? Koneksi akan terputus sementara.')) {
      setIsRebooting(true);
      onReboot();
      setTimeout(() => setIsRebooting(false), 5000);
    }
  };

  const relayKeys = Object.keys(relays).sort();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Status Perangkat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isDeviceOnline ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <Server className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">ESP32 Utama (Ruang Panel)</h4>
                  <p className="text-sm text-slate-500">ID: monitoring-pztm-004</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDeviceOnline ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                {isDeviceOnline ? 'Online' : 'Offline'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Firmware</span>
                </div>
                <p className="text-sm font-semibold">{monitoring.firmware_version || 'v1.0.0'}</p>
              </div>
              <div className="p-3 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Globe className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">IP Address</span>
                </div>
                <p className="text-sm font-semibold">{monitoring.ip_address || '192.168.1.15'}</p>
              </div>
            </div>

            <div className="p-3 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Terakhir Terlihat</span>
              </div>
              <p className="text-sm font-semibold">
                {monitoring.timestamp ? format(new Date(monitoring.timestamp), 'HH:mm:ss, dd MMM yyyy') : 'Tidak diketahui'}
              </p>
            </div>

            <button
              onClick={handleReboot}
              disabled={isRebooting || !isDeviceOnline}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors disabled:opacity-50 border border-red-100 dark:border-red-900/30 text-sm font-bold"
            >
              <Power className={`h-4 w-4 ${isRebooting ? 'animate-pulse' : ''}`} />
              {isRebooting ? 'Me-reboot...' : 'Reboot Perangkat'}
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Sinkronisasi Waktu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Terakhir Sinkronisasi</p>
                <p className="text-sm font-mono font-medium">
                  {lastSync ? format(new Date(lastSync), 'dd MMM yyyy, HH:mm:ss') : 'Belum pernah sinkron'}
                </p>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Waktu Sekarang'}
              </button>
              <p className="text-[10px] text-slate-500 text-center italic">
                Sinkronisasi memastikan timestamp data akurat setelah ESP32 reboot.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Kustomisasi Nama Relay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relayKeys.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Menunggu data relay dari perangkat...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relayKeys.map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {key.toUpperCase()}
                    </label>
                    <input
                      type="text"
                      value={names[key] || ''}
                      onChange={(e) => setNames({ ...names, [key]: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Nama untuk ${key}`}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={handleSave}
                disabled={isSaved}
                className={`mt-6 flex items-center justify-center w-full md:w-auto gap-2 px-6 py-2 text-white rounded-md transition-colors ${
                  isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Berhasil Disimpan!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Simpan Nama Relay
                  </>
                )}
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
