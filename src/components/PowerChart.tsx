import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonitoringData } from '../types';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface Props {
  data: MonitoringData[];
  mode?: 'line' | 'area' | 'bar' | 'candlestick' | 'load_curve';
}

const CandlestickShape = (props: any) => {
  const { x, y, width, height, payload } = props;
  const { open, close, high, low } = payload;
  
  const isGrowing = close >= open;
  const color = isGrowing ? '#10b981' : '#ef4444';
  
  const totalValue = high - low;
  const ratio = totalValue > 0 ? height / totalValue : 0;
  
  const maxBody = Math.max(open, close);
  const minBody = Math.min(open, close);
  
  const yBodyTop = y + (high - maxBody) * ratio;
  const bodyHeight = (maxBody - minBody) * ratio;
  
  const centerX = x + width / 2;
  
  return (
    <g>
      <line x1={centerX} y1={y} x2={centerX} y2={y + height} stroke={color} strokeWidth={2} />
      <rect 
        x={x} 
        y={yBodyTop} 
        width={width} 
        height={Math.max(bodyHeight, 2)} 
        fill={color} 
        stroke={color}
        rx={1}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (active && payload && payload.length) {
    if (mode === 'candlestick') {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-slate-600 dark:text-slate-400">Open: <span className="font-medium text-slate-900 dark:text-slate-100">{data.open.toFixed(1)} W</span></p>
            <p className="text-slate-600 dark:text-slate-400">High: <span className="font-medium text-slate-900 dark:text-slate-100">{data.high.toFixed(1)} W</span></p>
            <p className="text-slate-600 dark:text-slate-400">Low: <span className="font-medium text-slate-900 dark:text-slate-100">{data.low.toFixed(1)} W</span></p>
            <p className="text-slate-600 dark:text-slate-400">Close: <span className="font-medium text-slate-900 dark:text-slate-100">{data.close.toFixed(1)} W</span></p>
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
            <p className="text-blue-600 dark:text-blue-400">Tegangan: <span className="font-medium">{data.voltage.toFixed(1)} V</span></p>
            <p className="text-yellow-600 dark:text-yellow-400">Arus: <span className="font-medium">{data.current.toFixed(2)} A</span></p>
          </div>
        </div>
      );
    }
    return (
      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg">
        <p className="font-medium text-slate-900 dark:text-slate-100 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function PowerChart({ data, mode = 'line' }: Props) {
  const isOptimized = data.length > 1000;
  const displayData = isOptimized ? data.slice(-1000) : data;

  const chartData = useMemo(() => {
    if (mode === 'load_curve') {
      const hours = Array.from({ length: 24 }, (_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        power: 0,
        voltage: 0,
        current: 0,
        count: 0
      }));

      displayData.forEach(d => {
        if (!d.timestamp) return;
        const date = new Date(d.timestamp);
        const hour = date.getHours();
        if (hour >= 0 && hour < 24) {
          hours[hour].power += Number(d.power) || 0;
          hours[hour].voltage += Number(d.voltage) || 0;
          hours[hour].current += Number(d.current) || 0;
          hours[hour].count += 1;
        }
      });

      return hours.map(h => ({
        time: h.time,
        power: h.count > 0 ? Number((h.power / h.count).toFixed(2)) : 0,
        voltage: h.count > 0 ? Number((h.voltage / h.count).toFixed(2)) : 0,
        current: h.count > 0 ? Number((h.current / h.count).toFixed(2)) : 0,
      }));
    }

    if (mode === 'candlestick') {
      if (displayData.length === 0) return [];
      const span = (displayData[displayData.length - 1].timestamp || 0) - (displayData[0].timestamp || 0);
      const bucketSize = Math.max(5000, Math.floor(span / 40)); 
      
      const buckets: Record<number, any> = {};
      
      displayData.forEach(d => {
        const time = d.timestamp || 0;
        const bucketTime = Math.floor(time / bucketSize) * bucketSize;
        
        if (!buckets[bucketTime]) {
          buckets[bucketTime] = {
            time: format(new Date(bucketTime), 'HH:mm:ss'),
            timestamp: bucketTime,
            open: d.power,
            high: d.power,
            low: d.power,
            close: d.power,
            voltage: d.voltage,
            current: d.current,
            count: 1
          };
        } else {
          const b = buckets[bucketTime];
          b.high = Math.max(b.high, d.power);
          b.low = Math.min(b.low, d.power);
          b.close = d.power;
          b.count++;
          b.voltage = (b.voltage * (b.count - 1) + d.voltage) / b.count;
          b.current = (b.current * (b.count - 1) + d.current) / b.count;
        }
      });
      
      return Object.values(buckets).sort((a: any, b: any) => a.timestamp - b.timestamp).map((b: any) => ({
        ...b,
        range: [b.low, b.high]
      }));
    }

    return displayData.map(d => ({
      ...d,
      time: d.timestamp ? format(new Date(d.timestamp), 'HH:mm:ss') : ''
    }));
  }, [displayData, mode]);

  const shouldAnimate = displayData.length < 50;

  const renderChartElements = () => {
    if (mode === 'load_curve') {
      return (
        <>
          <defs>
            <linearGradient id="colorPowerLoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area yAxisId="left" type="monotone" dataKey="power" name="Daya (W)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPowerLoad)" isAnimationActive={shouldAnimate} />
          <Line yAxisId="right" type="monotone" dataKey="voltage" name="Tegangan (V)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
          <Line yAxisId="right-current" type="monotone" dataKey="current" name="Arus (A)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
        </>
      );
    }
    if (mode === 'candlestick') {
      return (
        <>
          <Bar yAxisId="left" dataKey="range" name="Daya (W) OHLC" shape={<CandlestickShape />} isAnimationActive={shouldAnimate} />
          <Line yAxisId="right" type="monotone" dataKey="voltage" name="Tegangan (V)" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
          <Line yAxisId="right-current" type="monotone" dataKey="current" name="Arus (A)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
        </>
      );
    }
    if (mode === 'area') {
      return (
        <>
          <Area yAxisId="left" type="monotone" dataKey="power" name="Daya (W)" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.3} isAnimationActive={shouldAnimate} />
          <Area yAxisId="right" type="monotone" dataKey="voltage" name="Tegangan (V)" fill="#10b981" stroke="#10b981" fillOpacity={0.3} isAnimationActive={shouldAnimate} />
          <Area yAxisId="right-current" type="monotone" dataKey="current" name="Arus (A)" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} isAnimationActive={shouldAnimate} />
        </>
      );
    }
    if (mode === 'bar') {
      return (
        <>
          <Bar yAxisId="left" dataKey="power" name="Daya (W)" fill="#3b82f6" isAnimationActive={shouldAnimate} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="voltage" name="Tegangan (V)" fill="#10b981" isAnimationActive={shouldAnimate} radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right-current" dataKey="current" name="Arus (A)" fill="#f59e0b" isAnimationActive={shouldAnimate} radius={[4, 4, 0, 0]} />
        </>
      );
    }
    return (
      <>
        <Line yAxisId="left" type="monotone" dataKey="power" name="Daya (W)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} isAnimationActive={shouldAnimate} />
        <Line yAxisId="right" type="monotone" dataKey="voltage" name="Tegangan (V)" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
        <Line yAxisId="right-current" type="monotone" dataKey="current" name="Arus (A)" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={shouldAnimate} />
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Grafik Penggunaan Daya Real-time</CardTitle>
          {isOptimized && (
            <div className="text-[10px] bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium border border-blue-100 dark:border-blue-800/50">
              Optimized (Last 1000 pts)
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 40, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  minTickGap={30}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}W`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}V`}
                />
                <YAxis 
                  yAxisId="right-current" 
                  orientation="right" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `${value}A`}
                  dx={10}
                />
                <Tooltip 
                  content={<CustomTooltip mode={mode} />}
                  cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                {renderChartElements()}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
