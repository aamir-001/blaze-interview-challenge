import { db } from '../database/db.js';
import { Notification } from '../types/index.js';

/**
 * Get all notifications for a user (via their alerts)
 */
export function getAllNotifications(userId: number): Notification[] {
  return db.prepare(`
    SELECT n.* FROM notifications n
    INNER JOIN alerts a ON n.alert_id = a.id
    WHERE a.user_id = ?
    ORDER BY n.triggered_at DESC
  `).all(userId) as Notification[];
}

/**
 * Get notifications by alert IDs
 */
export function getNotificationsByAlertIds(alertIds: number[]): Notification[] {
  if (alertIds.length === 0) {
    return [];
  }

  const placeholders = alertIds.map(() => '?').join(',');
  return db.prepare(`
    SELECT * FROM notifications
    WHERE alert_id IN (${placeholders})
  `).all(...alertIds) as Notification[];
}

/**
 * Create a new notification and atomically update alert's notified flag
 * This ensures notification creation and alert update happen together or not at all
 */
export function createNotification(alertId: number, triggeredRate: number, message?: string): Notification {
  // Use transaction for atomicity
  const transaction = db.transaction(() => {
    // 1. Create notification
    const result = db.prepare(`
      INSERT INTO notifications (alert_id, triggered_rate, message)
      VALUES (?, ?, ?)
    `).run(alertId, triggeredRate, message || null);

    const notificationId = result.lastInsertRowid as number;

    // 2. Update alert's notified flag and last_known_rate
    db.prepare(`
      UPDATE alerts
      SET notified = 1, last_known_rate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(triggeredRate, alertId);

    return notificationId;
  });

  const notificationId = transaction() as number;
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId) as Notification;
}

/**
 * Acknowledge a notification (mark as read)
 */
export function acknowledgeNotification(id: number, userId: number): Notification | null {
  // Verify the notification belongs to this user
  const notification = db.prepare(`
    SELECT n.* FROM notifications n
    INNER JOIN alerts a ON n.alert_id = a.id
    WHERE n.id = ? AND a.user_id = ?
  `).get(id, userId) as Notification | undefined;

  if (!notification) {
    return null;
  }

  // Update the notification
  db.prepare(`
    UPDATE notifications
    SET acknowledged = 1, acknowledged_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(id);

  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as Notification;
}
