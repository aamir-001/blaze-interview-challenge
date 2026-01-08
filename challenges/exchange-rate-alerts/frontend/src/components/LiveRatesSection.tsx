import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000/api';

interface RateHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HistoricalData {
  pair: string;
  name: string;
  current: number;
  history: RateHistory[];
}

interface LiveRatesSectionProps {}

export default function LiveRatesSection({}: LiveRatesSectionProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const fetchHistoricalData = async (pair: string) => {
    setLoadingHistory(true);
    try {
      const pairParam = pair.replace('/', '-');
      const response = await fetch(`${API_URL}/rates/${pairParam}/history`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePairClick = (pair: string) => {
    setSelectedPair(pair);
    fetchHistoricalData(pair);
  };

  const closeModal = () => {
    setSelectedPair(null);
    setHistoricalData(null);
  };

  const displayPairs = [
    { pair: 'USD/EUR', key: 'EUR' },
    { pair: 'USD/GBP', key: 'GBP' },
    { pair: 'USD/JPY', key: 'JPY' },
    { pair: 'USD/MXN', key: 'MXN' },
    { pair: 'USD/BRL', key: 'BRL' },
    { pair: 'USD/AUD', key: 'AUD' }
  ];

  return (
    <>
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
              <div
                key={pair}
                onClick={() => handlePairClick(pair)}
                className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <div className="text-sm font-medium text-gray-600">{pair}</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {rates[key] ? rates[key].toFixed(4) : '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Data Modal */}
      {selectedPair && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '700px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              position: 'relative',
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px 16px',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                {selectedPair} Historical Data
              </h3>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  Loading historical data...
                </div>
              ) : historicalData ? (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                      {historicalData.name}
                    </p>
                    <p style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
                      Current Rate: {historicalData.current.toFixed(4)}
                    </p>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '12px 8px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Date</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Open</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>High</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Low</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Close</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicalData.history.map((row, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '12px 8px', fontSize: '14px', color: '#1f2937' }}>
                              {new Date(row.date).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                              {row.open.toFixed(4)}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontFamily: 'monospace', color: '#059669' }}>
                              {row.high.toFixed(4)}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontFamily: 'monospace', color: '#dc2626' }}>
                              {row.low.toFixed(4)}
                            </td>
                            <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>
                              {row.close.toFixed(4)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                  Failed to load historical data
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
