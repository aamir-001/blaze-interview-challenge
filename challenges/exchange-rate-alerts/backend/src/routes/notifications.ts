import { Router } from 'express';
import { getAllNotifications, acknowledgeNotification } from '../services/notificationService.js';

const router = Router();

// Hardcoded user ID for demo
const DEMO_USER_ID = 1;

/**
 * GET /api/notifications
 * Get all notifications for the user
 */
router.get('/', (req, res) => {
  try {
    const notifications = getAllNotifications(DEMO_USER_ID);
    res.json(notifications);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * PATCH /api/notifications/:id/acknowledge
 * Acknowledge a notification (mark as read)
 */
router.patch('/:id/acknowledge', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const notification = acknowledgeNotification(id, DEMO_USER_ID);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error: any) {
    console.error('Error acknowledging notification:', error);
    res.status(500).json({ error: 'Failed to acknowledge notification' });
  }
});

export default router;
