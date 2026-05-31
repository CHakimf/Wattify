import { useState, useEffect, useRef, useMemo } from 'react';
import { ref, onValue, set, get, serverTimestamp, Database } from 'firebase/database';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { db as defaultDb, auth } from '../lib/firebase';
import { MonitoringData, RelayControl, Settings, WifiNetwork } from '../types';

const defaultSettings: Partial<Settings> = {
  threshold: 2200,
  tariffPerKwh: 1444.70,
  autoCutoff: true,
  dailyEnergyGoal: 5,
  relayNames: {}
};

export function useFirebaseData() {
  const [user, setUser] = useState<User | null>(null);
  const [monitoring, setMonitoring] = useState<MonitoringData>({ 
    voltage: 0, 
    current: 0, 
    power: 0, 
    energy: 0, 
    pf: 0, 
    frequency: 0,
    wifi_rssi: 0,
    wifi_quality: 0,
    uptime_s: 0,
    uptime_str: '',
    esp_temp: 0,
    free_heap: 0,
    heap_percent: 0,
    firmware_version: 'v1.0.0',
    ip_address: '0.0.0.0'
  });
  const [relays, setRelays] = useState<RelayControl>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings as Settings);
  const [availableNetworks, setAvailableNetworks] = useState<WifiNetwork[]>([]);
  const [history, setHistory] = useState<MonitoringData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);
  
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const isOfflineRef = useRef<boolean>(true);
  const systemDataRef = useRef<Partial<MonitoringData>>({});

  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(() => {
    return localStorage.getItem('wattify_auto_sync') !== 'false';
  });

  const toggleAutoSync = () => {
    setIsAutoSyncEnabled(prev => {
      const next = !prev;
      localStorage.setItem('wattify_auto_sync', String(next));
      return next;
    });
  };

  // Active database instance and user base path
  const [activeDb, setActiveDb] = useState<Database>(defaultDb);
  const [basePath, setBasePath] = useState<string>('');
  
  // Custom Firebase config trigger
  const [configHash, setConfigHash] = useState(() => Date.now());

  // Function to refresh config when user updates settings
  const refreshConfig = () => setConfigHash(Date.now());

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setIsLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Check for custom firebase connection
    const customApiKey = localStorage.getItem('wattify_firebase_api_key');
    const customDbUrl = localStorage.getItem('wattify_firebase_db_url');
    let currentDb = defaultDb;
    let currentBasePath = `users/${user.uid}`; // Device scoping per Google Account

    if (customApiKey && customDbUrl) {
      try {
        const apps = getApps();
        const customAppName = `CustomESP32_${user.uid}`;
        let customApp = apps.find(app => app.name === customAppName);
        if (!customApp) {
          customApp = initializeApp({
            apiKey: customApiKey,
            databaseURL: customDbUrl
          }, customAppName);
        }
        currentDb = getDatabase(customApp);
        // If they use their own DB, they might be writing to the root.
        // We'll use the root for backwards compatibility and ease of custom ESP32 setup.
        currentBasePath = '';
      } catch (e) {
        console.error("Failed to initialize custom Firebase app:", e);
      }
    }

    setActiveDb(currentDb);
    setBasePath(currentBasePath);

    const getPath = (path: string) => currentBasePath ? `${currentBasePath}/${path}` : path;
    const getRootPath = (path: string) => path; // Some things like .info/connected are always root

    const monitoringRef = ref(currentDb, getPath('monitoring'));
    const controlRef = ref(currentDb, getPath('control'));
    const settingsRef = ref(currentDb, getPath('settings'));
    const systemRef = ref(currentDb, getPath('system'));
    const connectedRef = ref(currentDb, getRootPath('.info/connected'));
    const syncRef = ref(currentDb, getPath('system/lastSync'));
    const networksRef = ref(currentDb, getPath('system/available_networks'));

    let monitoringLoaded = false;
    let controlLoaded = false;
    let settingsLoaded = false;
    let systemLoaded = false;

    const checkLoading = () => {
      if (monitoringLoaded && controlLoaded && settingsLoaded && systemLoaded) {
        setIsLoading(false);
      }
    };

    const unsubConnected = onValue(connectedRef, (snap) => {
      setIsServerConnected(snap.val() === true);
    });

    const unsubSync = onValue(syncRef, (snap) => {
      setLastSync(snap.val());
    });

    const unsubNetworks = onValue(networksRef, (snapshot) => {
      const data = snapshot.val();
      if (data && Array.isArray(data)) {
        // Handle both string array (from prompt) and object array
        const mapped = data.map(net => {
          if (typeof net === 'string') {
            return { ssid: net };
          }
          return net;
        }).filter(net => net && net.ssid);
        setAvailableNetworks(mapped);
      } else {
        setAvailableNetworks([]);
      }
    });

    let isInitialSystemLoad = true;
    let unsubSystem = () => {};
    if (isAutoSyncEnabled) {
      unsubSystem = onValue(systemRef, (snapshot) => {
        const data = snapshot.val();
        systemLoaded = true;
        if (data) {
          if (isInitialSystemLoad) {
            isInitialSystemLoad = false;
          } else {
            const now = Date.now();
            lastUpdateRef.current = now;
            isOfflineRef.current = false;
            setIsDeviceOnline(true);
          }
          systemDataRef.current = data;
          setMonitoring(prev => ({ ...prev, ...data }));
        }
        checkLoading();
      });
    } else {
      systemLoaded = true;
      checkLoading();
    }

    let isInitialMonitoringLoad = true;
    let unsubMonitoring = () => {};
    if (isAutoSyncEnabled) {
      unsubMonitoring = onValue(monitoringRef, (snapshot) => {
        const data = snapshot.val();
        monitoringLoaded = true;
        if (data) {
          let isActuallyOnline = false;
          const now = Date.now();
          if (isInitialMonitoringLoad) {
            isInitialMonitoringLoad = false;
          } else {
            isActuallyOnline = true;
            lastUpdateRef.current = now;
            isOfflineRef.current = false;
            setIsDeviceOnline(true);
          }
          
          const newData = { ...data, ...systemDataRef.current, timestamp: now };
          
          if (!isActuallyOnline) {
            newData.voltage = 0;
            newData.current = 0;
            newData.power = 0;
            newData.frequency = 0;
            newData.pf = 0;
            newData.wifi_rssi = 0;
            newData.esp_temp = 0;
            newData.free_heap = 0;
            newData.heap_percent = 0;
            newData.uptime_s = 0;
          }
          
          setMonitoring(newData);
          setHistory(prev => {
            const newHistory = [...prev, newData];
            // Keep last 500 data points for chart
            const trimmedHistory = newHistory.length > 500 ? newHistory.slice(newHistory.length - 500) : newHistory;
            
            // Sync to Firebase periodically (every 10 ticks = approx 50 seconds to avoid high bandwidth cost)
            // or just write it if we are small enough. For safety we write every 5th tick.
            if (newHistory.length % 5 === 0) {
              set(ref(currentDb, getPath('history')), trimmedHistory).catch(() => {});
            }

            return trimmedHistory;
          });
        }
        checkLoading();
      });
    } else {
      monitoringLoaded = true;
      checkLoading();
    }

    const unsubControl = onValue(controlRef, (snapshot) => {
      const data = snapshot.val();
      controlLoaded = true;
      if (data) {
        setRelays(data);
      } else {
        setRelays({});
      }
      checkLoading();
    });

    const unsubSettings = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      settingsLoaded = true;
      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
          relayNames: data.relayNames || {},
          relaySchedules: data.relaySchedules || {}
        });
      }
      checkLoading();
    });

    // Initialize default values if not exist
    get(settingsRef).then((snapshot) => {
      if (!snapshot.exists()) {
        set(settingsRef, defaultSettings);
      }
    });

    // Fetch history from Firebase
    const historyRef = ref(currentDb, getPath('history'));
    get(historyRef).then(snapshot => {
      if (snapshot.exists()) {
        setHistory(snapshot.val() || []);
      }
    });

    // Check device online status every 1 second
    // If no data received for 10 seconds, consider device offline
    const interval = setInterval(() => {
      if (isAutoSyncEnabled && lastUpdateRef.current > 0 && Date.now() - lastUpdateRef.current > 10000) {
        if (!isOfflineRef.current) {
          setIsDeviceOnline(false);
          isOfflineRef.current = true;
          setMonitoring(prev => ({
            ...prev,
            voltage: 0,
            current: 0,
            power: 0,
            frequency: 0,
            pf: 0,
            wifi_rssi: 0,
            esp_temp: 0,
            free_heap: 0,
            heap_percent: 0,
            uptime_s: 0
          }));
        }
      }
    }, 1000);

    return () => {
      unsubConnected();
      unsubSync();
      unsubNetworks();
      unsubSystem();
      unsubMonitoring();
      unsubControl();
      unsubSettings();
      clearInterval(interval);
    };
  }, [user, configHash]);

  // Helper for generating dynamic paths
  const getPath = (path: string) => basePath ? `${basePath}/${path}` : path;

  // Auto Cut-off Logic
  useEffect(() => {
    if (settings.autoCutoff && monitoring.power > settings.threshold) {
      const activeRelays = Object.keys(relays).filter(key => relays[key]);
      if (activeRelays.length > 0) {
        const offRelays = { ...relays };
        Object.keys(offRelays).forEach(key => offRelays[key] = false);
        set(ref(activeDb, getPath('control')), offRelays);
      }
    }
  }, [monitoring.power, settings.threshold, settings.autoCutoff, relays, activeDb, basePath]);

  const updateRelay = (relayKey: string, value: boolean) => {
    set(ref(activeDb, getPath(`control/${relayKey}`)), value);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    set(ref(activeDb, getPath('settings')), updatedSettings);
  };

  const syncTime = () => {
    set(ref(activeDb, getPath('system/sync')), serverTimestamp());
    set(ref(activeDb, getPath('system/lastSync')), Date.now());
  };

  const rebootDevice = () => {
    set(ref(activeDb, getPath('system/reboot')), serverTimestamp());
  };

  const factoryResetDevice = () => {
    set(ref(activeDb, getPath('system/factory_reset')), serverTimestamp());
  };

  const updateWifiConfig = (ssid: string, password: string) => {
    set(ref(activeDb, getPath('system/wifi_config')), {
      ssid,
      password,
      timestamp: serverTimestamp()
    });
  };

  const resetAllData = () => {
    setHistory([]);
    set(ref(activeDb, getPath('history')), []);
    
    // 2. Instruct ESP32 to reset energy counter
    set(ref(activeDb, getPath('system/reset_energy')), serverTimestamp());
  };

  const clearHistory = () => {
    setHistory([]);
    set(ref(activeDb, getPath('history')), []);
  };

  const logout = () => {
    signOut(auth);
  };

  return { 
    user,
    monitoring, 
    relays, 
    settings, 
    history, 
    availableNetworks,
    isServerConnected,
    isDeviceOnline,
    isLoading,
    lastSync,
    updateRelay, 
    updateSettings,
    syncTime,
    rebootDevice,
    factoryResetDevice,
    updateWifiConfig,
    clearHistory,
    resetAllData,
    logout,
    refreshConfig,
    isAutoSyncEnabled,
    toggleAutoSync
  };
}
