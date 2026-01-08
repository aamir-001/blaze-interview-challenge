import { Router } from 'express';
import { fetchCurrentRates, getHistoricalRates } from '../services/rateService.js';

const router = Router();

/**
 * GET /api/rates
 * Get current exchange rates for all supported currencies
 */
router.get('/', async (req, res) => {
  try {
    const rates = await fetchCurrentRates();
    res.json(rates);
  } catch (error: any) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch exchange rates' });
  }
});

/**
 * GET /api/rates/:pair/history
 * Get historical rates for a specific currency pair
 * Example: /api/rates/USD-MXN/history
 */
router.get('/:pair/history', (req, res) => {
  try {
    // Convert URL format to pair format: USD-MXN -> USD/MXN
    const pair = req.params.pair.replace('-', '/');

    const history = getHistoricalRates(pair);

    if (!history) {
      return res.status(404).json({ error: 'Historical data not found for this pair' });
    }

    res.json(history);
  } catch (error: any) {
    console.error('Error fetching historical rates:', error);
    res.status(500).json({ error: 'Failed to fetch historical rates' });
  }
});

export default router;
