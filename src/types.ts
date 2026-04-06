export interface MonitoringData {
  voltage: number;
  current: number;
  power: number;
  energy: number;
  frequency?: number;
  pf?: number;
  wifi_rssi?: number;
  wifi_quality?: number;
  uptime_s?: number;
  uptime_str?: string;
  esp_temp?: number;
  free_heap?: number;
  heap_percent?: number;
  firmware_version?: string;
  ip_address?: string;
  timestamp?: number;
}

export interface RelayControl {
  [key: string]: boolean;
}

export interface Settings {
  threshold: number;
  tariffPerKwh: number;
  autoCutoff: boolean;
  relayNames: {
    [key: string]: string;
  };
  ecoMode: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    ecoThreshold: number;
  };
}
