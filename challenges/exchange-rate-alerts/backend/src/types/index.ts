// Database types
export interface User {
  id: number;
  name: string;
  created_at: string;
}

export interface Alert {
  id: number;
  user_id: number;
  currency_pair: string;
  target_rate: number;
  direction: 'above' | 'below';
  enabled: boolean;
  notified: boolean;
  last_known_rate: number | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  alert_id: number;
  triggered_at: string;
  triggered_rate: number;
  message: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

// Alert Status (computed from alert + notifications)
// - active: Watching, no pending notifications
// - triggered: Has unacknowledged notification(s)
// - disabled: User manually disabled
export type AlertStatus = 'active' | 'triggered' | 'disabled';

export interface AlertWithStatus extends Alert {
  status: AlertStatus;
  distance_from_target?: number; // Percentage away from target
}

// API Request/Response types
export interface CreateAlertRequest {
  currency_pair: string;
  target_rate: number;
  direction: 'above' | 'below';
}

export interface UpdateAlertRequest {
  enabled?: boolean;
}

// Rate types
export interface ExchangeRates {
  [currency: string]: number;
}

export interface RateHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface RatePairHistory {
  pair: string;
  name: string;
  current: number;
  history: RateHistory[];
}

// Rate cache
export interface RateCache {
  rates: ExchangeRates;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}
