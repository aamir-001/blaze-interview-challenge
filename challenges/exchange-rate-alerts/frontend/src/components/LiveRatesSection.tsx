import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

interface LiveRatesSectionProps {}

export default function LiveRatesSection({}: LiveRatesSectionProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_URL}/rates`);
        const data = await response.json();
        setRates(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch rates:', error);
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayPairs = [
    { pair: 'USD/EUR', key: 'EUR' },
    { pair: 'USD/GBP', key: 'GBP' },
    { pair: 'USD/JPY', key: 'JPY' },
    { pair: 'USD/MXN', key: 'MXN' },
    { pair: 'USD/BRL', key: 'BRL' },
    { pair: 'USD/AUD', key: 'AUD' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Live Rates</h2>
        <span className="text-xs text-gray-500">Updates every 10s</span>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading rates...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {displayPairs.map(({ pair, key }) => (
            <div key={pair} className="border border-gray-200 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-600">{pair}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {rates[key] ? rates[key].toFixed(4) : '-'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
