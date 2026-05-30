import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Settings, MonitoringData } from '../types';
import { motion } from 'motion/react';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  monitoring: MonitoringData;
  settings: Settings;
}

export function PowerGauge({ monitoring, settings }: Props) {
  const power = monitoring.power || 0;
  const threshold = settings.threshold || 2200;
  
  const percentage = Math.min(Math.max((power / threshold) * 100, 0), 100);
  
  // Gauge SVG parameters
  const radius = 80;
  const strokeWidth = 16;
  const arcLength = Math.PI * radius; // Half circle
  
  // Dash offset calculations
  const dashoffset = arcLength - (percentage / 100) * arcLength;
  
  let colorClass = "stroke-emerald-500 dark:stroke-emerald-500";
  let statusText = "Normal";
  let statusColor = "text-emerald-500 dark:text-emerald-400";
  let StatusIcon = CheckCircle2;
  
  if (percentage >= 100) {
    colorClass = "stroke-red-500 dark:stroke-red-500";
    statusText = "Overload";
    statusColor = "text-red-500 dark:text-red-400";
    StatusIcon = AlertTriangle;
  } else if (percentage >= 85) {
    colorClass = "stroke-amber-500 dark:stroke-amber-500";
    statusText = "Warning (Mendekati Batas)";
    statusColor = "text-amber-500 dark:text-amber-400";
    StatusIcon = AlertTriangle;
  }

  return (
    <Card className="w-full mb-6 relative overflow-hidden border-slate-200 dark:border-slate-800">
      {percentage >= 100 && (
        <div className="absolute inset-0 bg-red-500/10 dark:bg-red-500/5 animate-pulse pointer-events-none" />
      )}
      <CardContent className="pt-6 pb-6 flex flex-col items-center">
        <div className="flex w-full items-center justify-between mb-4">
           <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
             <Activity className="w-4 h-4 text-blue-500" /> Beban Kelistrikan Terkini
           </h3>
           <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
             Batas Maksimal: {threshold}W
           </span>
        </div>
        
        <div className="relative w-72 h-40 flex justify-center items-end mt-2 overflow-hidden">
          <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-sm absolute top-0 left-0">
            {/* Background Arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* Foreground Arc */}
            <motion.path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                className={colorClass}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={arcLength}
                initial={{ strokeDashoffset: arcLength }}
                animate={{ strokeDashoffset: dashoffset }}
                transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          
          <div className="absolute bottom-1 flex flex-col items-center pb-1">
            <motion.div 
               className={`flex items-baseline gap-1 text-5xl font-black tracking-tighter ${statusColor}`}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
            >
              {power.toFixed(0)}<span className="text-2xl font-bold opacity-70">W</span>
            </motion.div>
            
            <div className={`flex items-center gap-1.5 mt-2 font-semibold text-sm ${statusColor}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {percentage.toFixed(1)}% — {statusText}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
