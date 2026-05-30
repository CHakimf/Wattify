import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Cpu, Save, Server, Check, Clock, RefreshCw, Info, Power, Globe, ShieldCheck, Wifi, RotateCcw } from 'lucide-react';
import { Settings, RelayControl, MonitoringData, WifiNetwork } from '../types';
import { format } from 'date-fns';
import { ConfirmModal } from './ConfirmModal';

interface Props {
  settings: Settings;
  relays: RelayControl;
  monitoring: MonitoringData;
  availableNetworks?: WifiNetwork[];
  isDeviceOnline: boolean;
  lastSync: number | null;
  onSave: (settings: Partial<Settings>) => void;
  onSyncTime: () => void;
  onReboot: () => void;
  onFactoryReset: () => void;
  onUpdateWifi: (ssid: string, password: string) => void;
}

export function DevicesPanel({ settings, relays, monitoring, availableNetworks = [], isDeviceOnline, lastSync, onSave, onSyncTime, onReboot, onFactoryReset, onUpdateWifi }: Props) {
  const [names, setNames] = useState(settings.relayNames);
  const [isSaved, setIsSaved] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRebooting, setIsRebooting] = useState(false);
  const [isFactoryResetting, setIsFactoryResetting] = useState(false);
  
  const [showRebootModal, setShowRebootModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWifiModal, setShowWifiModal] = useState(false);
  
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isWifiSaved, setIsWifiSaved] = useState(false);
  const [isCustomSsid, setIsCustomSsid] = useState(false);

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
    setShowRebootModal(true);
  };

  const executeReboot = () => {
    setIsRebooting(true);
    onReboot();
    setTimeout(() => setIsRebooting(false), 5000);
  };

  const handleFactoryReset = () => {
    setShowResetModal(true);
  };

  const executeFactoryReset = () => {
    setIsFactoryResetting(true);
    onFactoryReset();
    setTimeout(() => setIsFactoryResetting(false), 5000);
  };

  const handleWifiSave = () => {
    if (!wifiSsid) {
      alert('SSID tidak boleh kosong');
      return;
    }
    setShowWifiModal(true);
  };

  const executeWifiSave = () => {
    onUpdateWifi(wifiSsid, wifiPassword);
    setIsWifiSaved(true);
    setWifiSsid('');
    setWifiPassword('');
    setTimeout(() => setIsWifiSaved(false), 3000);
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
                <p className="text-sm font-semibold">{monitoring.ip || monitoring.ip_address || '192.168.1.15'}</p>
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

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={handleReboot}
                disabled={isRebooting || !isDeviceOnline}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/10 dark:hover:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md transition-colors disabled:opacity-50 border border-amber-100 dark:border-amber-900/30 text-sm font-bold"
              >
                <Power className={`h-4 w-4 ${isRebooting ? 'animate-pulse' : ''}`} />
                {isRebooting ? 'Me-reboot...' : 'Reboot'}
              </button>
              
              <button
                onClick={handleFactoryReset}
                disabled={isFactoryResetting || !isDeviceOnline}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md transition-colors disabled:opacity-50 border border-red-100 dark:border-red-900/30 text-sm font-bold"
                title="Hapus Koneksi WiFi di ESP32"
              >
                <RotateCcw className={`h-4 w-4 ${isFactoryResetting ? 'animate-spin' : ''}`} />
                {isFactoryResetting ? 'Resetting...' : 'Factory Reset'}
              </button>
            </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Konfigurasi WiFi Perangkat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 mb-2 border border-blue-100 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                Pilih atau masukkan jaringan WiFi baru untuk ESP32. Perangkat akan otomatis restart setelah konfigurasi diterima.
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    SSID (Nama WiFi)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomSsid(!isCustomSsid);
                      setWifiSsid('');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {isCustomSsid ? 'Pilih dari daftar' : 'Input manual'}
                  </button>
                </div>
                
                {isCustomSsid || availableNetworks.length === 0 ? (
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Masukkan SSID WiFi baru"
                  />
                ) : (
                  <select
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Jaringan WiFi --</option>
                    {availableNetworks.map((net, idx) => (
                      <option key={idx} value={net.ssid}>
                        {net.ssid} {net.rssi ? `(${net.rssi} dBm)` : ''} {net.open ? '(Open)' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Password WiFi
                </label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan password WiFi (kosongkan jika open)"
                />
              </div>
              <button
                onClick={handleWifiSave}
                disabled={isWifiSaved || !isDeviceOnline}
                className={`mt-2 flex items-center justify-center w-full gap-2 px-4 py-2 text-white rounded-md transition-colors disabled:opacity-50 ${
                  isWifiSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isWifiSaved ? (
                  <>
                    <Check className="h-4 w-4" />
                    Konfigurasi Terkirim!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Kirim Konfigurasi WiFi
                  </>
                )}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={showRebootModal}
        title="Reboot Perangkat?"
        message="Apakah Anda yakin ingin me-reboot perangkat? Koneksi akan terputus sementara selama proses restart."
        confirmText="Reboot"
        isDanger={true}
        onConfirm={executeReboot}
        onCancel={() => setShowRebootModal(false)}
      />

      <ConfirmModal
        isOpen={showResetModal}
        title="Factory Reset ESP32?"
        message="PERINGATAN BAHAYA: Tindakan ini akan menghapus semua konfigurasi WiFi pada fisik perangkat (ESP32) dan mengembalikannya ke jaringan AP default untuk pairing ulang. Namun data histori dan setting di aplikasi ini akan tetap aman. Lanjutkan?"
        confirmText="Reset Pabrik"
        isDanger={true}
        onConfirm={executeFactoryReset}
        onCancel={() => setShowResetModal(false)}
      />
      <ConfirmModal
        isOpen={showWifiModal}
        title="Ubah Konfigurasi WiFi?"
        message={`Perangkat akan mencoba terhubung ke WiFi "${wifiSsid}". Jika gagal (misal salah password), perangkat akan kembali memancarkan WiFi bawaan (Access Point) agar bisa di-setup ulang. Lanjutkan?`}
        confirmText="Terapkan WiFi"
        onConfirm={executeWifiSave}
        onCancel={() => setShowWifiModal(false)}
      />
    </div>
  );
}
