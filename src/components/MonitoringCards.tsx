import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Zap, Activity, Battery, DollarSign, AlertTriangle, Waves, Gauge, GripHorizontal } from 'lucide-react';
import { MonitoringData, Settings } from '../types';
import { motion } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  data: MonitoringData;
  settings: Settings;
  onUpdateOrder?: (order: string[]) => void;
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

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

interface SortableCardProps {
  id: string;
  card: any;
  key?: React.Key;
}

function SortableCard({ id, card }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <motion.div variants={itemVariants} ref={setNodeRef} style={style} className={`relative ${isDragging ? 'opacity-50' : ''}`}>
      <Card className={`h-full transition-shadow hover:shadow-lg ${card.overload ? "border-red-500 bg-red-50 dark:bg-red-900/20" : (card.warning ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" : "")}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <GripHorizontal className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.title}</CardTitle>
          </div>
          <card.icon className={`h-4 w-4 ${card.iconColor}`} />
        </CardHeader>
        <CardContent>
          <motion.div 
            key={card.value}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`text-2xl font-bold ${card.overload && card.title === 'Daya Aktif' ? 'text-red-600 dark:text-red-400' : (card.warning && card.title === 'Daya Aktif' ? 'text-yellow-600 dark:text-yellow-400' : '')}`}
          >
            {card.value}
          </motion.div>
          {card.subValue && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.subValue}</p>}
          {card.extra && <p className={`text-xs mt-1 ${card.overload ? 'text-red-500' : 'text-yellow-600 dark:text-yellow-400 font-medium'}`}>{card.extra}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MonitoringCards({ data, settings, onUpdateOrder }: Props) {
  const estimatedBill = (data.energy * settings.tariffPerKwh).toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
  const isOverload = data.power > settings.threshold;
  const isWarning = data.power > settings.threshold * 0.85 && !isOverload;

  const defaultCards = [
    {
      id: 'Tegangan',
      title: 'Tegangan',
      value: `${data.voltage.toFixed(1)} V`,
      icon: Activity,
      iconColor: 'text-blue-500',
      overload: isOverload,
      warning: isWarning
    },
    {
      id: 'Arus',
      title: 'Arus',
      value: `${data.current.toFixed(2)} A`,
      icon: Zap,
      iconColor: 'text-yellow-500',
      overload: isOverload,
      warning: isWarning
    },
    {
      id: 'Daya Aktif',
      title: 'Daya Aktif',
      value: `${data.power.toFixed(1)} W`,
      icon: isOverload ? AlertTriangle : (isWarning ? AlertTriangle : Activity),
      iconColor: isOverload ? 'text-red-500 animate-pulse' : (isWarning ? 'text-yellow-500 animate-bounce' : 'text-green-500'),
      overload: isOverload,
      warning: isWarning,
      extra: isOverload ? `Batas: ${settings.threshold}W` : (isWarning ? `Mendekati Batas (${settings.threshold}W)` : null)
    },
    {
      id: 'Frekuensi',
      title: 'Frekuensi',
      value: data.frequency !== undefined ? `${data.frequency.toFixed(2)} Hz` : '0.00 Hz',
      icon: Waves,
      iconColor: 'text-cyan-500',
    },
    {
      id: 'Power Factor',
      title: 'Power Factor',
      value: data.pf !== undefined ? data.pf.toFixed(2) : '0.00',
      icon: Gauge,
      iconColor: 'text-orange-500',
    },
    {
      id: 'Energi & Tagihan',
      title: 'Energi & Tagihan',
      value: `${data.energy.toFixed(2)} kWh`,
      icon: Battery,
      iconColor: 'text-purple-500',
      subValue: `Est: ${estimatedBill}`
    }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize order from settings or defaults
  const [items, setItems] = useState(() => {
    if (settings.cardOrder && settings.cardOrder.length > 0) {
      const ordered = settings.cardOrder.map(id => defaultCards.find(c => c.id === id)).filter(Boolean) as typeof defaultCards;
      const missing = defaultCards.filter(c => !settings.cardOrder!.includes(c.id));
      return [...ordered, ...missing];
    }
    return defaultCards;
  });

  // Keep values updated without triggering order reset
  const currentCards = useMemo(() => {
    return items.map((item: any) => {
      const updatedCard = defaultCards.find(c => c.id === item.id);
      return updatedCard || item;
    });
  }, [data, settings.threshold, settings.tariffPerKwh, items]);

  useEffect(() => {
     if (settings.cardOrder && settings.cardOrder.length > 0) {
        const currentOrder = items.map(i => i.id);
        // Only update if external order is different
        if (settings.cardOrder.join(',') !== currentOrder.join(',')) {
          const ordered = settings.cardOrder.map(id => defaultCards.find(c => c.id === id)).filter(Boolean) as typeof defaultCards;
          const missing = defaultCards.filter(c => !settings.cardOrder!.includes(c.id));
          setItems([...ordered, ...missing]);
        }
     }
  }, [settings.cardOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items: any[]) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        if (onUpdateOrder) {
          onUpdateOrder(newItems.map((i: any) => i.id));
        }
        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={currentCards.map(c => c.id)}
        strategy={rectSortingStrategy}
      >
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6"
        >
          {currentCards.map((card) => (
            <SortableCard key={card.id} id={card.id} card={card} />
          ))}
        </motion.div>
      </SortableContext>
    </DndContext>
  );
}
