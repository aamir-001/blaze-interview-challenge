import { Router } from 'express';
import {
  getAllAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} from '../services/alertService.js';
import { CreateAlertRequest, UpdateAlertRequest } from '../types/index.js';

const router = Router();

// Hardcoded user ID for demo
const DEMO_USER_ID = 1;

/**
 * GET /api/alerts
 * Get all alerts for the user
 */
router.get('/', (req, res) => {
  try {
    const alerts = getAllAlerts(DEMO_USER_ID);
    res.json(alerts);
  } catch (error: any) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * POST /api/alerts
 * Create a new alert
 */
router.post('/', (req, res) => {
  try {
    const data: CreateAlertRequest = req.body;

    // Validate input
    if (!data.currency_pair || !data.target_rate || !data.direction) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (data.target_rate <= 0) {
      return res.status(400).json({ error: 'Target rate must be positive' });
    }

    if (!['above', 'below'].includes(data.direction)) {
      return res.status(400).json({ error: 'Direction must be "above" or "below"' });
    }

    const alert = createAlert(DEMO_USER_ID, data);
    res.status(201).json(alert);
  } catch (error: any) {
    console.error('Error creating alert:', error);

    if (error.message === 'An identical alert already exists') {
      return res.status(409).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * PATCH /api/alerts/:id
 * Update an alert (enable/disable)
 */
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates: UpdateAlertRequest = req.body;

    const alert = updateAlert(id, DEMO_USER_ID, updates);
    res.json(alert);
  } catch (error: any) {
    console.error('Error updating alert:', error);

    if (error.message === 'Alert not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = deleteAlert(id, DEMO_USER_ID);

    if (!deleted) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

export default router;
