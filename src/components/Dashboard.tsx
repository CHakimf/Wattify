import React, { useEffect, useState } from 'react';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { MonitoringCards } from './MonitoringCards';
import { RelayControl } from './RelayControl';
import { PowerChart } from './PowerChart';
import { PowerGauge } from './PowerGauge';
import { SettingsPanel } from './SettingsPanel';
import { DataHistory } from './DataHistory';
import { PowerAnalysis } from './PowerAnalysis';
import { UsageStatistics } from './UsageStatistics';
import { DevicesPanel } from './DevicesPanel';
import { LoadCurveChart } from './LoadCurveChart';
import { HistoryTrendChart } from './HistoryTrendChart';
import { SystemDiagnosis } from './SystemDiagnosis';
import { useTheme } from '../hooks/useTheme';
import { Moon, Sun, Zap, Wifi, WifiOff, Server, Activity, Sliders, Cpu, Clock, LogIn, LineChart as LineChartIcon, AreaChart as AreaChartIcon, BarChart as BarChartIcon, CandlestickChart as CandlestickChartIcon, Database, Info, BookOpen, ChevronDown, Terminal } from 'lucide-react';
import { OnboardingModal } from './OnboardingModal';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { FirmwarePromptModal } from './FirmwarePromptModal';
import { motion, AnimatePresence } from 'motion/react';

const showNativeNotification = async (title: string, options: NotificationOptions) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration) {
        await registration.showNotification(title, options);
        return;
      }
    } catch (e) {
      console.error('Service Worker notification failed, falling back', e);
    }
  }
  
  new Notification(title, options);
};

export function Dashboard() {
  const { user, monitoring, relays, settings, history, availableNetworks, isServerConnected, isDeviceOnline, isLoading, lastSync, updateRelay, updateSettings, syncTime, rebootDevice, factoryResetDevice, updateWifiConfig, clearHistory, resetAllData, logout, refreshConfig, isAutoSyncEnabled, toggleAutoSync } = useFirebaseData();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notified, setNotified] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'control' | 'devices' | 'manage' | 'help'>('data');
  const [prevTab, setPrevTab] = useState<'data' | 'control' | 'devices' | 'manage' | 'help'>('data');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeframe, setTimeframe] = useState<number>(15); // Default 15 minutes
  const [chartMode, setChartMode] = useState<'line' | 'area' | 'bar' | 'candlestick' | 'load_curve'>('line');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFirmwarePrompt, setShowFirmwarePrompt] = useState(false);

  useEffect(() => {
    // Check if tutorial is completed
    const isCompleted = localStorage.getItem('wattify_tutorial_completed');
    if (isCompleted !== 'true' && !isLoading) {
      setShowOnboarding(true);
    }
  }, [isLoading]);

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

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Handle Overload & Warning Notification
  const [warningNotified, setWarningNotified] = useState(false);
  const [offlineNotified, setOfflineNotified] = useState(false);

  // Handle Offline Notification
  useEffect(() => {
    // Avoid triggering on initial load
    if (isLoading) return;

    if (!isDeviceOnline) {
      if (!offlineNotified) {
        if ('Notification' in window && Notification.permission === 'granted') {
          showNativeNotification('Perangkat Offline!', {
            body: 'Koneksi ke perangkat ESP32 terputus. Pastikan perangkat menyala dan terhubung dengan WiFi.',
            icon: '/favicon.ico'
          });
        } else if (!('Notification' in window) || Notification.permission !== 'granted') {
          alert('Perangkat Offline! Koneksi ke perangkat ESP32 terputus.');
        }
        setOfflineNotified(true);
      }
    } else {
      if (offlineNotified) {
        if ('Notification' in window && Notification.permission === 'granted') {
          showNativeNotification('Perangkat Online', {
            body: 'Koneksi ke perangkat ESP32 kembali terhubung.',
            icon: '/favicon.ico'
          });
        }
        setOfflineNotified(false);
      }
    }
  }, [isDeviceOnline, isLoading, offlineNotified]);

  useEffect(() => {
    const threshold = settings.threshold;
    const currentPower = monitoring.power;
    const warningThreshold = threshold * 0.85;

    if (currentPower > threshold) {
      if (!notified && 'Notification' in window && Notification.permission === 'granted') {
        showNativeNotification('Peringatan Overload!', {
          body: `Daya saat ini (${currentPower}W) melebihi batas (${threshold}W)`,
          icon: '/favicon.ico'
        });
        setNotified(true);
      }
    } else if (currentPower > warningThreshold) {
      if (!warningNotified && 'Notification' in window && Notification.permission === 'granted') {
        showNativeNotification('Peringatan: Mendekati Batas!', {
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
    { id: 'help', label: 'Dokumentasi', icon: BookOpen },
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

            {/* Sync Status */}
            {!isAutoSyncEnabled && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50" title="Sinkronisasi Data Dijeda">
                <Database className="h-4 w-4 opacity-50" />
                <span>Sync Dijeda</span>
              </div>
            )}

            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-mono font-medium border bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-700/50">
              <Clock className="h-4 w-4" />
              <span>{formattedTime}</span>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <button
              onClick={toggleTheme}
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
                      <div className="p-1 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowProfileModal(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50 rounded-xl transition-colors"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors">
                            <Info className="h-4 w-4" />
                          </div>
                          Profil & Pengaturan
                        </button>
                        
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-2" />

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-x-hidden relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {activeTab === 'data' && (
              <div className="space-y-6">
                <PowerGauge monitoring={monitoring} settings={settings} />
                <MonitoringCards data={monitoring} settings={settings} onUpdateOrder={(order) => updateSettings({ cardOrder: order })} />
                
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
                <DataHistory history={filteredHistory} onClearHistory={clearHistory} onResetData={resetAllData} />
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
              <div className="max-w-7xl mx-auto space-y-6">
                <SystemDiagnosis data={monitoring} />
                <DevicesPanel 
                  settings={settings} 
                  relays={relays} 
                  monitoring={monitoring}
                  availableNetworks={availableNetworks}
                  isDeviceOnline={isDeviceOnline} 
                  lastSync={lastSync}
                  onSave={updateSettings} 
                  onSyncTime={syncTime}
                  onReboot={rebootDevice}
                  onFactoryReset={factoryResetDevice}
                  onUpdateWifi={updateWifiConfig}
                />
              </div>
            )}

            {activeTab === 'help' && (
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Dokumentasi Fitur</h2>
                  <p className="text-slate-500 dark:text-slate-400">Jelajahi panduan penggunaan fitur-fitur pintar Wattify.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card 1 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
                      <Activity className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Monitoring Real-time</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Pantau secara langsung variabel kelistrikan dari ESP32 Anda. Sistem menampilkan <strong>Tegangan (V), Arus (A), Daya (W), Energi (kWh), Frekuensi (HZ)</strong> dan Power Factor. Data diperbarui setiap beberapa detik secara live.
                    </p>
                  </div>
                  
                  {/* Card 2 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center mb-4">
                      <LineChartIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Analisis & Riwayat (Grafik)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Lakukan analisis data mingguan atau sesi berjalan dengan mudah melalui grafik garis (Line), area, dan grafik Load Curve khusus. Anda juga bisa mengekspor laporan data sensor ke dalam format Excel / CSV.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center mb-4">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Manajemen Perangkat</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Kelola kesehatan (Diagnosis) ESP32 langsung dari Web. Anda dapat melihat <strong>Kualitas Sinyal WiFi, RAM (Heap), Temperatur CPU</strong>, bahkan mengubah jaringan WiFi dan melakukan reboot (restart) MCU dari jarak jauh.
                    </p>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm md:col-span-2 lg:col-span-3 hover:border-blue-500/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                          <Terminal className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Kode Firmware ESP32</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                          Ingin merakit dan memprogram Hardware sendiri? Anda bisa menggunakan Prompt khusus yang kami siapkan. Cukup salin Prompt ini ke AI Assistant (seperti Gemini atau ChatGPT) dan AI akan membuatkan program Firebase C++ ESP32 utuh untuk Anda.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowFirmwarePrompt(true)}
                        className="whitespace-nowrap px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Terminal className="w-4 h-4" />
                        Lihat Prompt Kode
                      </button>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg flex items-center justify-center mb-4">
                      <Sliders className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Kontrol Relay Jarak Jauh</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Nyalakan (ON) atau matikan (OFF) stop kontak / saklar via relay dari mana saja. Anda juga bisa mengganti Label / Nama Relay dengan <strong>menekan kotak relay agak lama (long-press)</strong>.
                    </p>
                  </div>

                  {/* Card 5 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center mb-4">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Proteksi (Auto Cut-off)</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Lindungi kelistrikan rumah Anda dari korsleting. Tentukan batas maksimal daya (misal: 1000 W). Jika daya sensor menyentuh angka ini, ESP32 akan langsung memutus arus semua jalur relay seketika (Kill Switch).
                    </p>
                  </div>

                  {/* Card 6 */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border dark:border-slate-800 shadow-sm">
                    <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Penjadwalan Cerdas</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      Atur jam berapa sebuah relay harus hidup (ON), dan jam berapa ia harus mati otomatis (OFF). Hal ini sangat berguna untuk automasi lampu teras atau perangkat yang beroperasi secara periodik tanpa membebani rutinitas harian Anda.
                    </p>
                  </div>
                </div>
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

      <OnboardingModal 
        isOpen={showOnboarding} 
        onComplete={() => setShowOnboarding(false)} 
        onSaveConfig={refreshConfig}
      />

      <ProfileSettingsModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={user}
        onLogout={logout}
        onResetData={resetAllData}
        onShowTutorial={() => {
          setShowProfileModal(false);
          setShowOnboarding(true);
        }}
        onSaveConfig={refreshConfig}
        isAutoSyncEnabled={isAutoSyncEnabled}
        toggleAutoSync={toggleAutoSync}
      />

      <FirmwarePromptModal
        isOpen={showFirmwarePrompt}
        onClose={() => setShowFirmwarePrompt(false)}
      />
    </div>
  );
}
