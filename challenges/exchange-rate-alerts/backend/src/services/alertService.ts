import { db } from '../database/db.js';
import { Alert, AlertWithStatus, CreateAlertRequest, Notification, AlertStatus } from '../types/index.js';
import { getNotificationsByAlertIds } from './notificationService.js';

/**
 * Get all alerts for a user with computed status
 */
export function getAllAlerts(userId: number): AlertWithStatus[] {
  const alerts = db.prepare(`
    SELECT * FROM alerts
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as Alert[];

  if (alerts.length === 0) {
    return [];
  }

  // Get all notifications for these alerts
  const alertIds = alerts.map(a => a.id);
  const notifications = getNotificationsByAlertIds(alertIds);

  // Compute status for each alert
  return alerts.map(alert => computeAlertStatus(alert, notifications));
}

/**
 * Create a new alert
 */
export function createAlert(userId: number, data: CreateAlertRequest): Alert {
  const stmt = db.prepare(`
    INSERT INTO alerts (user_id, currency_pair, target_rate, direction)
    VALUES (?, ?, ?, ?)
  `);

  try {
    const result = stmt.run(userId, data.currency_pair, data.target_rate, data.direction);
    const alertId = result.lastInsertRowid as number;

    return db.prepare('SELECT * FROM alerts WHERE id = ?').get(alertId) as Alert;
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      // Check if a disabled alert exists
      const existing = db.prepare(`
        SELECT * FROM alerts
        WHERE user_id = ?
        AND currency_pair = ?
        AND target_rate = ?
        AND direction = ?
      `).get(userId, data.currency_pair, data.target_rate, data.direction) as Alert | undefined;

      if (existing && !existing.enabled) {
        // Re-enable the existing alert
        return updateAlert(existing.id, userId, { enabled: true });
      }

      throw new Error('An identical alert already exists');
    }

    throw error;
  }
}

/**
 * Update an alert (typically enable/disable)
 */
export function updateAlert(id: number, userId: number, updates: { enabled?: boolean }): Alert {
  const alert = db.prepare('SELECT * FROM alerts WHERE id = ? AND user_id = ?').get(id, userId) as Alert | undefined;

  if (!alert) {
    throw new Error('Alert not found');
  }

  if (updates.enabled !== undefined) {
    db.prepare(`
      UPDATE alerts
      SET enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(updates.enabled ? 1 : 0, id);
  }

  return db.prepare('SELECT * FROM alerts WHERE id = ?').get(id) as Alert;
}

/**
 * Delete an alert (when user disables, we delete instead of setting enabled=false)
 */
export function deleteAlert(id: number, userId: number): boolean {
  const result = db.prepare(`
    DELETE FROM alerts
    WHERE id = ? AND user_id = ?
  `).run(id, userId);

  return result.changes > 0;
}

/**
 * Get all enabled alerts (for rate checker)
 */
export function getEnabledAlerts(): Alert[] {
  return db.prepare(`
    SELECT * FROM alerts
    WHERE enabled = 1
  `).all() as Alert[];
}

/**
 * Update alert's notified flag and last_known_rate
 */
export function updateAlertNotified(id: number, notified: boolean, lastKnownRate: number): void {
  db.prepare(`
    UPDATE alerts
    SET notified = ?, last_known_rate = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(notified ? 1 : 0, lastKnownRate, id);
}

/**
 * Compute alert status based on notifications
 */
function computeAlertStatus(alert: Alert, allNotifications: Notification[]): AlertWithStatus {
  // Check if disabled
  if (!alert.enabled) {
    return {
      ...alert,
      status: 'disabled' as AlertStatus
    };
  }

  // Check if has unacknowledged notifications
  const hasUnacknowledgedNotif = allNotifications.some(
    n => n.alert_id === alert.id && !n.acknowledged
  );

  const status: AlertStatus = hasUnacknowledgedNotif ? 'triggered' : 'active';

  return {
    ...alert,
    status
  };
}

