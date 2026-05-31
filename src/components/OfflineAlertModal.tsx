import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Lightbulb, X } from 'lucide-react';

interface OfflineAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OfflineAlertModal({ isOpen, onClose }: OfflineAlertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <WifiOff className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  Perangkat Offline!
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                  Koneksi ke perangkat ESP32 telah terputus selama lebih dari 10 detik. Sistem tidak dapat memperbarui data secara real-time.
                </p>

                <div className="w-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg p-4 text-left">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-500 mb-2">
                    <Lightbulb className="w-4 h-4" /> Tips Mengatasi:
                  </h4>
                  <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-2 list-disc pl-5">
                    <li>Pastikan ESP32 menerima daya yang cukup (kabel terhubung).</li>
                    <li>Periksa apakah jaringan WiFi "<strong>Wattify</strong>" atau SSID target menyala.</li>
                    <li>Dekatkan posisi perangkat (ESP32) dengan jangkauan router WiFi.</li>
                    <li>Jika lampu indikator redup, coba restart manual dengan mencabut dan memasang kembali dayanya.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-center">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Mengerti
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
