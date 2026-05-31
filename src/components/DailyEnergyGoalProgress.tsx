import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BatteryWarning, TrendingUp, AlertTriangle } from 'lucide-react';
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
  const todayStr = format(new Date(), 'dd MMM yyyy');
  let todayEnergy = 0;
  
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

  // Use the calculated today's energy from history, or fallback to something else if needed.
  // Actually, wait, if the device resets or something, maybe we just use energyTotal (which is monitoring.energy)
  // if today's energy is too calculated wrongly?
  // Let's stick with todayEnergy calculation, and if it's 0 but energyTotal is > 0 and no history, use energyTotal (though less accurate).
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
        
        <div className="h-2.5 w-full bg-white dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full ${statusColor}`}
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
      </motion.div>
    </AnimatePresence>
  );
}
