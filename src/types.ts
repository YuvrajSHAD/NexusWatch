export interface PingResult {
  region: string;
  latency_ms?: number;
  status: 'success' | 'failed' | 'error';
  message?: string;
}

export interface LocationData {
  [key: string]: {
    lat: number;
    lng: number;
  };
}

export interface Agent {
  ip: string;
  region: string;
  lat: number;
  lng: number;
}