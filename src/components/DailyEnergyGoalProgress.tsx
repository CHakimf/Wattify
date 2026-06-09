import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BatteryWarning, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { MonitoringData, Settings } from '../types';
import { format } from 'date-fns';

interface Props {
  history: MonitoringData[];
  settings: Settings;
  energyTotal: number;
}

export function DailyEnergyGoalProgress({ history, settings, energyTotal }: Props) {
  const goal = settings.dailyEnergyGoal;
  if (!goal || goal <= 0) return null;

  // Calculate today's energy consumption
  const todayRaw = new Date();
  const todayKey = `${todayRaw.getFullYear()}-${String(todayRaw.getMonth() + 1).padStart(2, '0')}-${String(todayRaw.getDate()).padStart(2, '0')}`;
  
  let todayEnergy = 0;
  
  if (settings.dailyEnergyStarts && typeof settings.dailyEnergyStarts[todayKey] === 'number') {
    // Exact value from Firebase!
    const startVal = settings.dailyEnergyStarts[todayKey];
    todayEnergy = Math.max(0, energyTotal - startVal);
  } else {
    // Fallback to old behavior
    const todayStr = format(new Date(), 'dd MMM yyyy');
    if (history && history.length > 0) {
      const todayData = history.filter(d => 
        d.timestamp && 
        format(new Date(d.timestamp), 'dd MMM yyyy') === todayStr && 
        typeof d.energy === 'number'
      );
      
      if (todayData.length > 0) {
        const minE = Math.min(...todayData.map(d => d.energy));
        const maxE = Math.max(...todayData.map(d => d.energy));
        todayEnergy = Math.max(0, maxE - minE);
      }
    }
  }

  const currentConsumption = todayEnergy > 0 ? todayEnergy : 0;
  
  const percentage = Math.min(100, Math.max(0, (currentConsumption / goal) * 100));
  
  let statusColor = 'bg-blue-500';
  let bgColor = 'bg-blue-100 dark:bg-blue-900/30';
  let textColor = 'text-blue-700 dark:text-blue-300';
  
  if (percentage >= 100) {
    statusColor = 'bg-red-500';
    bgColor = 'bg-red-100 dark:bg-red-900/30';
    textColor = 'text-red-700 dark:text-red-400';
  } else if (percentage >= 80) {
    statusColor = 'bg-amber-500';
    bgColor = 'bg-amber-100 dark:bg-amber-900/30';
    textColor = 'text-amber-700 dark:text-amber-400';
  }

  // Predictive estimation
  let timeEstimateStr = "";
  if (percentage < 100 && currentConsumption > 0) {
    // Calculate average power over the last 5 minutes (or available history if less)
    const recentData = history.slice(-30); // Last 30 data points (~30 seconds to a few minutes)
    if (recentData.length > 0) {
      const avgPower = recentData.reduce((sum, d) => sum + (d.power || 0), 0) / recentData.length;
      
      if (avgPower > 10) { // At least 10W to make a meaningful estimate
        const remainingEnergy = goal - currentConsumption;
        const avgPowerKw = avgPower / 1000;
        const hoursToGoal = remainingEnergy / avgPowerKw;
        
        if (hoursToGoal < 24) {
          const h = Math.floor(hoursToGoal);
          const m = Math.floor((hoursToGoal - h) * 60);
          if (h > 0) {
            timeEstimateStr = `Sisa waktu: ${h}j ${m}m (${avgPower.toFixed(0)}W saat ini)`;
          } else {
            timeEstimateStr = `Sisa waktu: ${m} menit (${avgPower.toFixed(0)}W saat ini)`;
          }
        } else {
          timeEstimateStr = `Lebih dari 24 jam dengan konsumsi saat ini`;
        }
      }
    }
  }

  const NOTIFICATION_KEY = 'wattify_last_prediction_notification';

  useEffect(() => {
    if (!("Notification" in window) || percentage >= 100 || currentConsumption <= 0) return;

    if (history.length > 0) {
      const recentData = history.slice(-30);
      const avgPower = recentData.reduce((sum, d) => sum + (d.power || 0), 0) / recentData.length;
      
      if (avgPower > 10) {
        const remainingEnergy = goal - currentConsumption;
        const avgPowerKw = avgPower / 1000;
        const hoursToGoal = remainingEnergy / avgPowerKw;

        // If goal will be reached in 2 hours or less
        if (hoursToGoal > 0 && hoursToGoal <= 2) {
          const lastNotifiedStr = localStorage.getItem(NOTIFICATION_KEY);
          const lastNotified = lastNotifiedStr ? parseInt(lastNotifiedStr, 10) : 0;
          const now = Date.now();
          
          // Only notify once per hour
          if (now - lastNotified > 60 * 60 * 1000) {
            const h = Math.floor(hoursToGoal);
            const m = Math.floor((hoursToGoal - h) * 60);
            
            const showNotification = () => {
              new Notification("Sistem Peringatan Dini", {
                body: `Dengan penggunaan rata-rata ${avgPower.toFixed(0)}W saat ini, batas target energi harian Anda akan terlampaui dalam estimasi waktu ${h} jam ${m} menit.`,
                icon: "/favicon.ico"
              });
              localStorage.setItem(NOTIFICATION_KEY, now.toString());
            };

            if (Notification.permission === "granted") {
              showNotification();
            } else if (Notification.permission !== "denied") {
              Notification.requestPermission().then((permission) => {
                if (permission === "granted") {
                  showNotification();
                }
              });
            }
          }
        }
      }
    }
  }, [history, currentConsumption, goal, percentage]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-6 p-4 rounded-xl border ${bgColor.replace('bg-', 'border-').replace('/30', '')} ${bgColor}`}
      >
        <div className="flex items-center gap-3 mb-2">
          {percentage >= 100 ? (
            <AlertTriangle className={`h-5 w-5 ${textColor}`} />
          ) : percentage >= 80 ? (
            <BatteryWarning className={`h-5 w-5 ${textColor}`} />
          ) : (
            <TrendingUp className={`h-5 w-5 ${textColor}`} />
          )}
          <span className={`font-semibold ${textColor}`}>
            Target Konsumsi Energi Harian: {goal} kWh
          </span>
          <span className={`ml-auto font-bold ${textColor}`}>
            {currentConsumption.toFixed(3)} kWh ({percentage.toFixed(1)}%)
          </span>
        </div>
        
        <div className="h-2.5 w-full bg-white dark:bg-slate-800 rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full transition-shadow duration-500 ${statusColor} ${percentage >= 95 ? 'animate-pulse ' + (percentage >= 100 ? 'shadow-[0_0_12px_rgba(239,68,68,0.8)]' : 'shadow-[0_0_12px_rgba(245,158,11,0.8)]') : ''}`}
          />
        </div>
        
        {percentage >= 100 && (
          <p className={`mt-2 text-sm font-medium ${textColor}`}>
            Peringatan: Anda telah melampaui batas konsumsi energi harian yang ditetapkan!
          </p>
        )}
        {percentage >= 80 && percentage < 100 && (
          <p className={`mt-2 text-sm font-medium ${textColor}`}>
            Perhatian: Konsumsi energi Anda mendekati batas harian.
          </p>
        )}
        
        {timeEstimateStr && percentage < 100 && (
          <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium opacity-80 ${textColor}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Estimasi pencapaian batas: {timeEstimateStr}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
