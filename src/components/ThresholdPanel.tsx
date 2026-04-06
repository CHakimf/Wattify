import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ShieldAlert, Save, Check } from 'lucide-react';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  onSaveSettings: (settings: Partial<Settings>) => void;
}

export function ThresholdPanel({ settings, onSaveSettings }: Props) {
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
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                localAutoCutoff ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Batas Daya Maksimum
              </label>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 rounded text-sm font-bold">
                {localThreshold} W
              </span>
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
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                Berhasil Disimpan!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Terapkan Batas Daya
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
