import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Power, ShieldAlert, Save, Check } from 'lucide-react';
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
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalThreshold(settings.threshold);
    setLocalAutoCutoff(settings.autoCutoff);
  }, [settings.threshold, settings.autoCutoff]);

  const handleSaveSmartControl = () => {
    onSaveSettings({ 
      threshold: localThreshold,
      autoCutoff: localAutoCutoff
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
                  className="flex flex-col items-center justify-center p-4 border rounded-lg dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
                >
                  <span className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-300 text-center line-clamp-1">
                    {settings.relayNames[key] || `Relay ${key.replace(/\D/g, '') || key}`}
                  </span>
                  <button
                    onClick={() => onToggle(key, !relays[key])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      relays[key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  >
                    <motion.span
                      animate={{ x: relays[key] ? 24 : 4 }}
                      className="inline-block h-4 w-4 transform rounded-full bg-white shadow-sm"
                    />
                  </button>
                  <span className={`mt-2 text-xs font-semibold ${relays[key] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {relays[key] ? 'ON' : 'OFF'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
