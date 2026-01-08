import { ExchangeRates, RatePairHistory } from '../types/index.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration: Set to 1 to use real Blaze API, or 0 to use local dummy data
 */
const RATE_SOURCE: 0 | 1 = 0;
const BLAZE_API_URL = 'https://api.blaze.money/currency/rates';

/**
 * Fetch current exchange rates from Blaze API
 */
async function fetchRatesFromBlaze(): Promise<ExchangeRates> {
  try {
    const response = await fetch(BLAZE_API_URL);

    if (!response.ok) {
      throw new Error(`Blaze API returned ${response.status}`);
    }

    const rates = await response.json() as ExchangeRates;
    return rates;
  } catch (error) {
    console.error('Failed to fetch rates from Blaze API:', error);
    throw new Error('Unable to fetch rates from Blaze API');
  }
}

/**
 * Fetch current exchange rates from dummy file for testing
 */
async function fetchRatesFromDummy(): Promise<ExchangeRates> {
  try {
    const dummyRatesPath = path.join(__dirname, '../../dummy-rates.json');
    const rates = JSON.parse(readFileSync(dummyRatesPath, 'utf-8'));
    return rates;
  } catch (error) {
    console.error('Failed to read dummy rates:', error);
    throw new Error('Unable to fetch rates from dummy file');
  }
}

/**
 * Fetch current exchange rates based on configuration
 */
export async function fetchCurrentRates(): Promise<ExchangeRates> {
  if (RATE_SOURCE === 1) {
    return fetchRatesFromBlaze();
  } else {
    return fetchRatesFromDummy();
  }
}

/**
 * Get historical rates for a specific currency pair from mock data
 */
export function getHistoricalRates(pair: string): RatePairHistory | null {
  try {
    const mockDataPath = path.join(__dirname, '../../../mock-rates.json');
    const mockData = JSON.parse(readFileSync(mockDataPath, 'utf-8'));

    // Convert pair format: USD/MXN -> USD/MXN (already correct)
    const pairData = mockData.pairs[pair];

    if (!pairData) {
      return null;
    }

    return {
      pair,
      name: pairData.name,
      current: pairData.current,
      history: pairData.history
    };
  } catch (error) {
    console.error('Failed to read mock rates:', error);
    return null;
  }
}

/**
 * Convert currency pairs to USD base format
 * USD/MXN stays as is, MXN would become USD/MXN
 */
export function normalizeCurrencyPair(pair: string): string {
  if (pair.startsWith('USD/')) {
    return pair;
  }
  return `USD/${pair}`;
}

/**
 * Get current rate for a specific currency pair
 */
export async function getCurrentRateForPair(currencyPair: string): Promise<number | null> {
  try {
    const rates = await fetchCurrentRates();

    // Extract target currency from pair (e.g., "USD/MXN" -> "MXN")
    const targetCurrency = currencyPair.split('/')[1];

    return rates[targetCurrency] || null;
  } catch (error) {
    console.error(`Failed to get rate for ${currencyPair}:`, error);
    return null;
  }
}
