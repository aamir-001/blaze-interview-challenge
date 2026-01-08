import { useState, FormEvent } from 'react';
import { CURRENCY_PAIRS, Alert } from '../types';

interface AlertFormProps {
  onSubmit: (alert: Omit<Alert, 'id' | 'notified' | 'created_at'>) => Promise<void>;
}

export default function AlertForm({ onSubmit }: AlertFormProps) {
  const [currencyPair, setCurrencyPair] = useState(CURRENCY_PAIRS[0]);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetRate, setTargetRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!targetRate || isNaN(Number(targetRate)) || Number(targetRate) <= 0) {
      alert('Please enter a valid target rate');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        currency_pair: currencyPair,
        direction,
        target_rate: Number(targetRate),
      });
      setTargetRate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Alert</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currency-pair" className="block text-sm font-medium text-gray-700 mb-1">
            Currency Pair
          </label>
          <select
            id="currency-pair"
            value={currencyPair}
            onChange={(e) => setCurrencyPair(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CURRENCY_PAIRS.map((pair) => (
              <option key={pair} value={pair}>
                {pair}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-1">
            Alert When Rate Goes
          </label>
          <select
            id="direction"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>
        </div>

        <div>
          <label htmlFor="target-rate" className="block text-sm font-medium text-gray-700 mb-1">
            Target Rate
          </label>
          <input
            id="target-rate"
            type="number"
            step="0.0001"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            placeholder="e.g., 1.2500"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {submitting ? 'Creating...' : 'Create Alert'}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-xs text-gray-600">
          <strong>Preview:</strong> Alert me when {currencyPair} goes{' '}
          <span className="font-semibold">{direction}</span>{' '}
          <span className="font-semibold">{targetRate || '___'}</span>
        </p>
      </div>
    </div>
  );
}
