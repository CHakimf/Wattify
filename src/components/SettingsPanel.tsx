import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Settings as SettingsIcon, Save, Check } from 'lucide-react';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  onSave: (settings: Partial<Settings>) => void;
}

export function SettingsPanel({ settings, onSave }: Props) {
  const [localSettings, setLocalSettings] = useState<Settings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Pengaturan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md mx-auto space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Tarif Listrik (Rp/kWh)
              </label>
              <input
                type="number"
                value={localSettings.tariffPerKwh}
                onChange={(e) => setLocalSettings({ ...localSettings, tariffPerKwh: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">Digunakan untuk estimasi tagihan listrik pada dashboard.</p>
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaved}
              className={`flex items-center justify-center w-full gap-2 px-4 py-2 text-white rounded-md transition-colors ${
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
                  Simpan Tarif
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
