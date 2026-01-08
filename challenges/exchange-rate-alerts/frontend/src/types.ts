export interface Alert {
  id: number;
  currency_pair: string;
  direction: 'above' | 'below';
  target_rate: number;
  enabled: boolean;
  notified: boolean;
  created_at: string;
  last_known_rate?: number;
}

export interface Notification {
  id: number;
  alert_id: number;
  triggered_rate: number;
  message: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
  alert?: Alert;
}

export const CURRENCY_PAIRS = [
  'USD/EUR',
  'USD/GBP',
  'USD/JPY',
  'USD/AUD',
  'USD/CAD',
  'EUR/GBP',
  'EUR/JPY'
];
