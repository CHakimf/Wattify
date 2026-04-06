import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Zap, Activity, Battery, DollarSign, AlertTriangle, Waves, Gauge } from 'lucide-react';
import { MonitoringData, Settings } from '../types';
import { motion } from 'motion/react';

interface Props {
  data: MonitoringData;
  settings: Settings;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

export function MonitoringCards({ data, settings }: Props) {
  const estimatedBill = (data.energy * settings.tariffPerKwh).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  const isOverload = data.power > settings.threshold;
  const isWarning = data.power > settings.threshold * 0.85 && !isOverload;

  const cards = [
    {
      title: 'Tegangan',
      value: `${data.voltage.toFixed(1)} V`,
      icon: Activity,
      iconColor: 'text-blue-500',
      overload: isOverload,
      warning: isWarning
    },
    {
      title: 'Arus',
      value: `${data.current.toFixed(2)} A`,
      icon: Zap,
      iconColor: 'text-yellow-500',
      overload: isOverload,
      warning: isWarning
    },
    {
      title: 'Daya Aktif',
      value: `${data.power.toFixed(1)} W`,
      icon: isOverload ? AlertTriangle : (isWarning ? AlertTriangle : Activity),
      iconColor: isOverload ? 'text-red-500 animate-pulse' : (isWarning ? 'text-yellow-500 animate-bounce' : 'text-green-500'),
      overload: isOverload,
      warning: isWarning,
      extra: isOverload ? `Batas: ${settings.threshold}W` : (isWarning ? `Mendekati Batas (${settings.threshold}W)` : null)
    },
    {
      title: 'Frekuensi',
      value: data.frequency !== undefined ? `${data.frequency.toFixed(2)} Hz` : '0.00 Hz',
      icon: Waves,
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Power Factor',
      value: data.pf !== undefined ? data.pf.toFixed(2) : '0.00',
      icon: Gauge,
      iconColor: 'text-orange-500',
    },
    {
      title: 'Energi & Tagihan',
      value: `${data.energy.toFixed(2)} kWh`,
      icon: Battery,
      iconColor: 'text-purple-500',
      subValue: `Est: ${estimatedBill}`
    }
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
    >
      {cards.map((card, idx) => (
        <motion.div key={idx} variants={item}>
          <Card className={`h-full transition-shadow hover:shadow-lg ${card.overload ? "border-red-500 bg-red-50 dark:bg-red-900/20" : (card.warning ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "")}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.overload && card.title === 'Daya Aktif' ? 'text-red-600 dark:text-red-400' : (card.warning && card.title === 'Daya Aktif' ? 'text-yellow-600 dark:text-yellow-400' : '')}`}>
                {card.value}
              </div>
              {card.subValue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.subValue}</p>}
              {card.extra && <p className={`text-xs mt-1 ${card.overload ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400 font-medium'}`}>{card.extra}</p>}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
