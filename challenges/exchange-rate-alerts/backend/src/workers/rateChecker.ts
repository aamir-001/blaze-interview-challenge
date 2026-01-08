import cron from 'node-cron';
import { getEnabledAlerts, updateAlertNotified } from '../services/alertService.js';
import { createNotification } from '../services/notificationService.js';
import { fetchCurrentRates } from '../services/rateService.js';
import { Alert } from '../types/index.js';

/**
 * Check if alert should trigger based on current rate
 */
function shouldTrigger(alert: Alert, currentRate: number): boolean {
  const { direction, target_rate, notified } = alert;

  // Only trigger if not already notified
  if (notified) {
    return false;
  }

  // Check threshold hit or crossing
  if (direction === 'above') {
    return currentRate >= target_rate;
  } else {
    return currentRate <= target_rate;
  }
}

/**
 * Check if alert should reset (price crossed back to safe side)
 */
function shouldReset(alert: Alert, currentRate: number): boolean {
  const { direction, target_rate, notified } = alert;

  // Only reset if currently notified
  if (!notified) {
    return false;
  }

  // Check if crossed back to safe side
  if (direction === 'above') {
    return currentRate < target_rate; // Dropped back below
  } else {
    return currentRate > target_rate; // Rose back above
  }
}

/**
 * Main rate checking logic
 */
export async function checkAlerts(): Promise<void> {
  try {
    // Fetch current rates
    const rates = await fetchCurrentRates();

    // Get all enabled alerts
    const alerts = getEnabledAlerts();

    if (alerts.length === 0) {
      return;
    }

    console.log(`Checking ${alerts.length} enabled alert(s)...`);

    for (const alert of alerts) {
      // Extract currency from pair (e.g., "USD/MXN" -> "MXN")
      const targetCurrency = alert.currency_pair.split('/')[1];
      const currentRate = rates[targetCurrency];

      if (!currentRate) {
        console.warn(`Rate not found for ${alert.currency_pair}`);
        continue;
      }

      // Check if alert should reset
      if (shouldReset(alert, currentRate)) {
        console.log(`✅ Resetting alert #${alert.id} - price crossed back to safe side`);
        updateAlertNotified(alert.id, false, currentRate);
        continue;
      }

      // Check if alert should trigger
      if (shouldTrigger(alert, currentRate)) {
        // Generate descriptive message
        const message = alert.direction === 'above'
          ? `${alert.currency_pair} crossed above ${alert.target_rate}`
          : `${alert.currency_pair} dropped below ${alert.target_rate}`;

        console.log(`🔔 Alert #${alert.id} triggered! ${message} (current: ${currentRate})`);

        // Create notification with descriptive message
        createNotification(alert.id, currentRate, message);
      } else {
        // Just update last known rate
        updateAlertNotified(alert.id, alert.notified, currentRate);
      }
    }
  } catch (error) {
    console.error('Error in rate checker:', error);
    // Continue to next cycle - don't crash the worker
  }
}

/**
 * Start the rate checker cron job
 * Runs every 30 seconds
 */
export function startRateChecker(): void {
  // Run immediately on start
  checkAlerts();

  // Schedule to run every 30 seconds
  cron.schedule('*/5 * * * * *', () => {
    checkAlerts();
  });

  console.log('✅ Rate checker started (runs every 30 seconds)');
}
