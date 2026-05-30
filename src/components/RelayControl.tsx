import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Power, ShieldAlert, Save, Check, X, AlertTriangle, Clock, Lightbulb } from 'lucide-react';
import { RelayControl as RelayControlType, Settings } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  relays: RelayControlType;
  settings: Settings;
  onToggle: (relay: keyof RelayControlType, value: boolean) => void;
  onSaveSettings: (settings: Partial<Settings>) => void;
}

export function RelayControl({ relays, settings, onToggle, onSaveSettings }: Props) {
  const relayKeys = Object.keys(relays).sort();
  const [localThreshold, setLocalThreshold] = useState(settings.threshold);
  const [localAutoCutoff, setLocalAutoCutoff] = useState(settings.autoCutoff);
  const [localSchedules, setLocalSchedules] = useState(settings.relaySchedules || {});
  const [isSaved, setIsSaved] = useState(false);
  const [isScheduleSaved, setIsScheduleSaved] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Modal and Long Press States
  const [editingRelayKey, setEditingRelayKey] = useState<string | null>(null);
  const [editingRelayName, setEditingRelayName] = useState('');
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalThreshold(settings.threshold);
    setLocalAutoCutoff(settings.autoCutoff);
    setLocalSchedules(settings.relaySchedules || {});
  }, [settings.threshold, settings.autoCutoff, settings.relaySchedules]);

  useEffect(() => {
    const dismissed = localStorage.getItem('wattify_cutoff_tooltip_dismissed');
    if (!dismissed) {
      setShowTooltip(true);
    }
  }, []);

  const dismissTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('wattify_cutoff_tooltip_dismissed', 'true');
  };

  const handleSaveSmartControl = () => {
    onSaveSettings({ 
      threshold: localThreshold,
      autoCutoff: localAutoCutoff
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSaveSchedules = () => {
    onSaveSettings({
      relaySchedules: localSchedules
    });
    setIsScheduleSaved(true);
    setTimeout(() => setIsScheduleSaved(false), 3000);
  };

  const updateSchedule = (key: string, field: 'enabled' | 'onTime' | 'offTime', value: boolean | string) => {
    setLocalSchedules(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { enabled: false, onTime: '18:00', offTime: '06:00' }),
        [field]: value
      }
    }));
  };

  const handlePointerDown = (key: string) => {
    const timer = setTimeout(() => {
      setEditingRelayKey(key);
      setEditingRelayName(settings.relayNames[key] || `Relay ${key.replace(/\D/g, '') || key}`);
    }, 1500); // 1.5 seconds long press
    setPressTimer(timer);
  };

  const handlePointerUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleSaveRelayName = () => {
    if (editingRelayKey) {
      onSaveSettings({
        relayNames: {
          ...settings.relayNames,
          [editingRelayKey]: editingRelayName
        }
      });
      setEditingRelayKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Power className="h-5 w-5" />
            Kontrol Relay
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relayKeys.length === 0 ? (
            <div className="text-center py-8 text-slate-500 border rounded-lg border-dashed dark:border-slate-800">
              Tidak ada relay yang terdeteksi pada perangkat.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relayKeys.map((key) => (
                <motion.div 
                  key={key} 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onPointerDown={() => handlePointerDown(key)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2 mb-3 pointer-events-none">
                    <Lightbulb 
                      className={`h-4 w-4 ${relays[key] ? 'text-green-500 fill-green-500/20' : 'text-slate-400'}`} 
                    />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300 text-center line-clamp-1">
                      {settings.relayNames[key] || `Relay ${key.replace(/\D/g, '') || key}`}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggle(key, !relays[key]);
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      relays[key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      animate={{ x: relays[key] ? 24 : 4 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm pointer-events-none"
                    />
                  </button>
                  <span className={`mt-2 text-xs font-semibold pointer-events-none ${relays[key] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {relays[key] ? 'ON' : 'OFF'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {editingRelayKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b dark:border-slate-800">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Kustomisasi Nama Relay</h3>
                <button onClick={() => setEditingRelayKey(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Nama Baru untuk {editingRelayKey.replace(/\D/g, '') ? `Relay ${editingRelayKey.replace(/\D/g, '')}` : editingRelayKey}
                  </label>
                  <input
                    type="text"
                    value={editingRelayName}
                    onChange={(e) => setEditingRelayName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contoh: Lampu Teras"
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-2">Tekan agak lama pada kotak relay untuk membuka menu ini.</p>
                </div>
                <button
                  onClick={handleSaveRelayName}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Simpan Nama
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Keamanan & Batas Daya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg relative">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Penting: Auto Cut-off</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed pr-6">
                          Fitur ini adalah sistem proteksi kritis. Jika diaktifkan, Wattify akan <strong>memutus aliran listrik semua relay secara otomatis</strong> jika mendeteksi penggunaan daya melebihi "Batas Daya Maksimum" yang Anda tentukan di bawah. Ini mencegah kelebihan beban listrik dan potensi bahaya.
                        </p>
                      </div>
                      <button 
                        onClick={dismissTooltip}
                        className="absolute top-2 right-2 p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                        aria-label="Tutup pesan"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between p-4 border rounded-lg dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Cut-off (Mati Otomatis)</h4>
                  <p className="text-xs text-slate-500">Matikan semua relay jika daya melebihi batas</p>
                </div>
                <button
                  onClick={() => setLocalAutoCutoff(!localAutoCutoff)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localAutoCutoff ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  <motion.span 
                    animate={{ x: localAutoCutoff ? 24 : 4 }}
                    className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm" 
                  />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Batas Daya Maksimum
                  </label>
                  <motion.span 
                    key={localThreshold}
                    initial={{ scale: 1.2, color: '#3b82f6' }}
                    animate={{ scale: 1, color: '#1d4ed8' }}
                    className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded text-sm font-bold"
                  >
                    {localThreshold} W
                  </motion.span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={localThreshold}
                  onChange={(e) => setLocalThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>100 W</span>
                  <span>5000 W</span>
                </div>
              </div>

              <button
                onClick={handleSaveSmartControl}
                disabled={isSaved}
                className={`flex items-center justify-center w-full gap-2 px-4 py-2 text-white rounded-md transition-colors ${
                  isSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isSaved ? (
                    <motion.div 
                      key="saved"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Berhasil Disimpan!
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="save"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      Terapkan Batas Daya
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Relay Otomatis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relayKeys.length === 0 ? (
              <div className="text-center py-4 text-slate-500">
                Data relay belum tersedia.
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-800 text-sm text-slate-600 dark:text-slate-300">
                  Tentukan jam nyala dan mati otomatis untuk masing-masing relay.
                </div>
                
                <div className="space-y-4">
                  {relayKeys.map((key) => {
                    const relayName = settings.relayNames[key] || `Relay ${key.replace(/\D/g, '') || key}`;
                    const schedule = localSchedules[key] || { enabled: false, onTime: '18:00', offTime: '06:00' };
                    
                    return (
                      <div key={key} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm gap-4 sm:gap-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateSchedule(key, 'enabled', !schedule.enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              schedule.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          >
                            <motion.span
                              animate={{ x: schedule.enabled ? 24 : 4 }}
                              className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                            />
                          </button>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{relayName}</p>
                            <p className="text-xs text-slate-500">{schedule.enabled ? 'Jadwal Aktif' : 'Jadwal Nonaktif'}</p>
                          </div>
                        </div>

                        <div className={`flex items-center gap-3 transition-opacity ${schedule.enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jam Nyala</label>
                            <input 
                              type="time" 
                              value={schedule.onTime}
                              onChange={(e) => updateSchedule(key, 'onTime', e.target.value)}
                              disabled={!schedule.enabled}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-sm w-24"
                            />
                          </div>
                          <span className="text-slate-400 mt-4">-</span>
                          <div className="flex flex-col">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jam Mati</label>
                            <input 
                              type="time" 
                              value={schedule.offTime}
                              onChange={(e) => updateSchedule(key, 'offTime', e.target.value)}
                              disabled={!schedule.enabled}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded text-sm w-24"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleSaveSchedules}
                  disabled={isScheduleSaved}
                  className={`flex items-center justify-center w-full gap-2 px-4 py-2 text-white rounded-md transition-colors mt-6 ${
                    isScheduleSaved ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isScheduleSaved ? (
                     <div className="flex items-center gap-2">
                       <Check className="h-4 w-4" />
                       Jadwal Disimpan!
                     </div>
                  ) : (
                     <div className="flex items-center gap-2">
                       <Save className="h-4 w-4" />
                       Simpan Jadwal Relay
                     </div>
                  )}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
