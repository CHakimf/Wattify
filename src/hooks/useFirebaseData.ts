import { useState, useEffect, useRef } from 'react';
import { ref, onValue, set, get, serverTimestamp } from 'firebase/database';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { MonitoringData, RelayControl, Settings } from '../types';

const defaultSettings: Partial<Settings> = {
  threshold: 2200,
  tariffPerKwh: 1444.70,
  autoCutoff: true,
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
  const [history, setHistory] = useState<MonitoringData[]>(() => {
    const saved = localStorage.getItem('wattify_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastSync, setLastSync] = useState<number | null>(null);
  
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [isDeviceOnline, setIsDeviceOnline] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const systemDataRef = useRef<Partial<MonitoringData>>({});

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

    const monitoringRef = ref(db, 'monitoring');
    const controlRef = ref(db, 'control');
    const settingsRef = ref(db, 'settings');
    const systemRef = ref(db, 'system');
    const connectedRef = ref(db, '.info/connected');
    const syncRef = ref(db, 'system/lastSync');

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

    const unsubSystem = onValue(systemRef, (snapshot) => {
      const data = snapshot.val();
      systemLoaded = true;
      if (data) {
        const now = Date.now();
        lastUpdateRef.current = now;
        setIsDeviceOnline(true);
        systemDataRef.current = data;
        setMonitoring(prev => ({ ...prev, ...data }));
      }
      checkLoading();
    });

    const unsubMonitoring = onValue(monitoringRef, (snapshot) => {
      const data = snapshot.val();
      monitoringLoaded = true;
      if (data) {
        const now = Date.now();
        lastUpdateRef.current = now;
        setIsDeviceOnline(true);
        
        const newData = { ...data, ...systemDataRef.current, timestamp: now };
        setMonitoring(newData);
        setHistory(prev => {
          const newHistory = [...prev, newData];
          // Keep last 2000 data points for chart (approx 2.5 hours if 1 point / 5 sec)
          if (newHistory.length > 2000) return newHistory.slice(newHistory.length - 2000);
          return newHistory;
        });
      }
      checkLoading();
    });

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
          relayNames: data.relayNames || {}
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

    // Check device online status every 5 seconds
    // If no data received for 15 seconds, consider device offline
    const interval = setInterval(() => {
      if (lastUpdateRef.current > 0 && Date.now() - lastUpdateRef.current > 15000) {
        setIsDeviceOnline(false);
      }
    }, 5000);

    return () => {
      unsubConnected();
      unsubSync();
      unsubSystem();
      unsubMonitoring();
      unsubControl();
      unsubSettings();
      clearInterval(interval);
    };
  }, [user]);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wattify_history', JSON.stringify(history));
  }, [history]);

  // Auto Cut-off Logic
  useEffect(() => {
    if (settings.autoCutoff && monitoring.power > settings.threshold) {
      const activeRelays = Object.keys(relays).filter(key => relays[key]);
      if (activeRelays.length > 0) {
        const offRelays = { ...relays };
        Object.keys(offRelays).forEach(key => offRelays[key] = false);
        set(ref(db, 'control'), offRelays);
      }
    }
  }, [monitoring.power, settings.threshold, settings.autoCutoff, relays]);

  const updateRelay = (relayKey: string, value: boolean) => {
    set(ref(db, `control/${relayKey}`), value);
  };

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    set(ref(db, 'settings'), updatedSettings);
  };

  const syncTime = () => {
    set(ref(db, 'system/sync'), serverTimestamp());
    set(ref(db, 'system/lastSync'), Date.now());
  };

  const rebootDevice = () => {
    set(ref(db, 'system/reboot'), serverTimestamp());
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('wattify_history');
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
    isServerConnected,
    isDeviceOnline,
    isLoading,
    lastSync,
    updateRelay, 
    updateSettings,
    syncTime,
    rebootDevice,
    clearHistory,
    logout
  };
}
