import React, { useEffect, useState } from 'react';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { MonitoringCards } from './MonitoringCards';
import { RelayControl } from './RelayControl';
import { PowerChart } from './PowerChart';
import { SettingsPanel } from './SettingsPanel';
import { DataHistory } from './DataHistory';
import { PowerAnalysis } from './PowerAnalysis';
import { UsageStatistics } from './UsageStatistics';
import { DevicesPanel } from './DevicesPanel';
import { LoadCurveChart } from './LoadCurveChart';
import { HistoryTrendChart } from './HistoryTrendChart';
import { SystemDiagnosis } from './SystemDiagnosis';
import { VideoTutorial } from './VideoTutorial';
import { Moon, Sun, Zap, Wifi, WifiOff, Server, Activity, Sliders, Cpu, Clock, LogIn, LineChart as LineChartIcon, AreaChart as AreaChartIcon, BarChart as BarChartIcon, CandlestickChart as CandlestickChartIcon, Database, Info, Play, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function Dashboard() {
  const { user, monitoring, relays, settings, history, isServerConnected, isDeviceOnline, isLoading, lastSync, updateRelay, updateSettings, syncTime, rebootDevice, clearHistory, logout } = useFirebaseData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notified, setNotified] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'control' | 'devices' | 'manage' | 'help'>('data');
  const [prevTab, setPrevTab] = useState<'data' | 'control' | 'devices' | 'manage' | 'help'>('data');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeframe, setTimeframe] = useState<number>(15); // Default 15 minutes
  const [chartMode, setChartMode] = useState<'line' | 'area' | 'bar' | 'candlestick' | 'load_curve'>('line');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabOrder = ['data', 'manage', 'control', 'devices', 'help'];
  const direction = tabOrder.indexOf(activeTab) > tabOrder.indexOf(prevTab) ? 1 : -1;

  const handleTabChange = (tab: 'data' | 'control' | 'devices' | 'manage' | 'help') => {
    setPrevTab(activeTab);
    setActiveTab(tab);
  };

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle Overload & Warning Notification
  const [warningNotified, setWarningNotified] = useState(false);
  useEffect(() => {
    const threshold = settings.threshold;
    const currentPower = monitoring.power;
    const warningThreshold = threshold * 0.85;

    if (currentPower > threshold) {
      if (!notified && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Peringatan Overload!', {
          body: `Daya saat ini (${currentPower}W) melebihi batas (${threshold}W)`,
          icon: '/favicon.ico'
        });
        setNotified(true);
      }
    } else if (currentPower > warningThreshold) {
      if (!warningNotified && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Peringatan: Mendekati Batas!', {
          body: `Daya saat ini (${currentPower}W) sudah mencapai 85% dari batas (${threshold}W)`,
          icon: '/favicon.ico'
        });
        setWarningNotified(true);
      }
      setNotified(false);
    } else {
      setNotified(false);
      setWarningNotified(false);
    }
  }, [monitoring.power, settings.threshold, notified, warningNotified]);

  const tabs = [
    { id: 'data', label: 'Data', icon: Activity },
    { id: 'manage', label: 'Kelola', icon: Database },
    { id: 'control', label: 'Kontrol', icon: Sliders },
    { id: 'devices', label: 'Perangkat', icon: Cpu },
    { id: 'help', label: 'Tutorial', icon: Play },
  ];

  const timeframes = [
    { label: '5 Menit', value: 5 },
    { label: '15 Menit', value: 15 },
    { label: '1 Jam', value: 60 },
    { label: 'Semua', value: 0 },
  ];

  const filteredHistory = React.useMemo(() => {
    if (timeframe === 0) return history;
    const cutoff = Date.now() - timeframe * 60 * 1000;
    return history.filter(d => (d.timestamp || 0) >= cutoff);
  }, [history, timeframe]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-24">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-500/20 mb-6"
            >
              <Zap className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold tracking-tight mb-2">Wattify</h2>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-2 w-2 bg-blue-600 rounded-full"
                />
                <span className="text-sm font-medium">Menghubungkan ke Firebase...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div 
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              className="bg-blue-600 p-2 rounded-lg"
            >
              <Zap className="h-5 w-5 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">Wattify</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Server Status */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${isServerConnected ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'}`} title="Status Server Firebase">
              <Server className="h-3.5 w-3.5" />
              <span>{isServerConnected ? 'Server OK' : 'Server Disconnected'}</span>
            </div>

            {/* Device Status */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${isDeviceOnline ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50' : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50'}`} title="Status Perangkat ESP32">
              {isDeviceOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>{isDeviceOnline ? 'ESP32 Online' : 'ESP32 Offline'}</span>
            </div>

            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-medium border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50">
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all active:scale-95"
              >
                <div className="hidden sm:block text-right mr-1">
                  <div className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[100px]">
                    {user?.displayName || user?.email?.split('@')[0]}
                  </div>
                  <div className="text-[8px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Admin</div>
                </div>
                <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs overflow-hidden shadow-sm">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    (user?.displayName?.[0] || user?.email?.[0] || 'A').toUpperCase()
                  )}
                </div>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-20 py-2 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 mb-1">Masuk sebagai</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email}</p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors group"
                        >
                          <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-white dark:group-hover:bg-red-900/40 transition-colors">
                            <LogIn className="h-4 w-4 rotate-180" />
                          </div>
                          Keluar Sesi
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, x: direction * 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === 'data' && (
              <div className="space-y-6">
                <MonitoringCards data={monitoring} settings={settings} />
                <SystemDiagnosis data={monitoring} />
                
                <div className="flex justify-end items-center gap-3 mb-4">
                  <div className="relative">
                    <select
                      value={timeframe}
                      onChange={(e) => setTimeframe(Number(e.target.value))}
                      className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 py-1.5 pl-3 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
                    >
                      {timeframes.map(tf => (
                        <option key={tf.value} value={tf.value}>{tf.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => setChartMode('line')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${chartMode === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      title="Grafik Garis"
                    >
                      <LineChartIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Line</span>
                    </button>
                    <button
                      onClick={() => setChartMode('area')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${chartMode === 'area' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      title="Grafik Area"
                    >
                      <AreaChartIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Area</span>
                    </button>
                    <button
                      onClick={() => setChartMode('bar')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${chartMode === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      title="Grafik Batang"
                    >
                      <BarChartIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Bar</span>
                    </button>
                    <button
                      onClick={() => setChartMode('candlestick')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${chartMode === 'candlestick' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      title="Grafik Candlestick"
                    >
                      <CandlestickChartIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Candle</span>
                    </button>
                    <button
                      onClick={() => setChartMode('load_curve')}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium ${chartMode === 'load_curve' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
                      title="Load Curve"
                    >
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">Load Curve</span>
                    </button>
                  </div>
                </div>

                <PowerChart data={filteredHistory} mode={chartMode} />
                <PowerAnalysis history={filteredHistory} settings={settings} />
              </div>
            )}

            {activeTab === 'manage' && (
              <div className="space-y-6">
                <HistoryTrendChart history={filteredHistory} />
                <LoadCurveChart history={filteredHistory} />
                <DataHistory history={filteredHistory} onClearHistory={clearHistory} />
                <UsageStatistics history={filteredHistory} settings={settings} />
              </div>
            )}

            {activeTab === 'control' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <RelayControl 
                  relays={relays} 
                  settings={settings} 
                  onToggle={updateRelay} 
                  onSaveSettings={updateSettings}
                />
                <SettingsPanel settings={settings} onSave={updateSettings} />
              </div>
            )}

            {activeTab === 'devices' && (
              <div className="max-w-4xl mx-auto space-y-6">
                <DevicesPanel 
                  settings={settings} 
                  relays={relays} 
                  monitoring={monitoring}
                  isDeviceOnline={isDeviceOnline} 
                  lastSync={lastSync}
                  onSave={updateSettings} 
                  onSyncTime={syncTime}
                  onReboot={rebootDevice}
                />
              </div>
            )}

            {activeTab === 'help' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Pusat Bantuan & Tutorial</h2>
                  <p className="text-slate-500 dark:text-slate-400">Pelajari cara memaksimalkan penggunaan Wattify untuk efisiensi energi Anda.</p>
                </div>
                <VideoTutorial />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] rounded-full px-2 py-2 flex gap-2 border dark:border-slate-800 z-50">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 ${
              activeTab === tab.id 
                ? 'text-blue-700 dark:text-blue-400' 
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className={`h-5 w-5 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`} />
            <AnimatePresence mode="popLayout">
              {activeTab === tab.id && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-sm font-bold overflow-hidden whitespace-nowrap"
                >
                  {tab.label}
                </motion.span>
              )}
              {activeTab !== tab.id && (
                <span className="text-sm font-medium hidden sm:block">
                  {tab.label}
                </span>
              )}
            </AnimatePresence>
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-100 dark:bg-blue-900/40 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
