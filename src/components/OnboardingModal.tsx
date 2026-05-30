import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Database, Key, CheckCircle2, ChevronRight, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onComplete: () => void;
  onSaveConfig?: () => void;
}

export function OnboardingModal({ isOpen, onComplete, onSaveConfig }: Props) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [dbUrl, setDbUrl] = useState('');

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save config
      if (apiKey && dbUrl) {
        localStorage.setItem('wattify_firebase_api_key', apiKey);
        localStorage.setItem('wattify_firebase_db_url', dbUrl);
        if (onSaveConfig) onSaveConfig();
      }
      localStorage.setItem('wattify_tutorial_completed', 'true');
      onComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border dark:border-slate-800"
      >
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {step === 1 && 'Selamat Datang di Wattify'}
              {step === 2 && 'Hubungkan ESP32 Anda'}
              {step === 3 && 'Siap Digunakan!'}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Zap className="w-12 h-12" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-center text-lg">
                  Wattify adalah platform modern untuk memantau dan mengontrol kelistrikan Anda menggunakan ESP32 secara real-time.
                </p>
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-800 text-sm">
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Pantau tegangan, arus, dan daya</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Kontrol saklar/relay dari jarak jauh</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span>Proteksi korsleting otomatis</span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800/50 mb-6 flex items-start gap-3 text-yellow-800 dark:text-yellow-200">
                  <Database className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm leading-relaxed text-yellow-700 dark:text-yellow-300">
                    Untuk terhubung dengan perangkat ESP32 Anda, kami membutuhkan API Key dan Database URL Firebase Anda. Anda bisa melewatinya dan menggunakan mode demo.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Firebase API Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Key className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="AIzaSy..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Firebase Database URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Database className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="https://your-project.firebaseio.com"
                      value={dbUrl}
                      onChange={(e) => setDbUrl(e.target.value)}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center py-6"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Konfigurasi Selesai</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Anda sudah siap untuk mulai mengatur dan memantau perangkat kelistrikan. 
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${step === i ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 dark:bg-slate-700'}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {step === 2 && (
              <button 
                onClick={handleNext}
                className="px-4 py-2 font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Lewati
              </button>
            )}
            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              {step === 3 ? 'Mulai Dashboard' : 'Lanjut'}
              {step !== 3 && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
