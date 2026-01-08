import { Alert } from '../types';

interface AlertListProps {
  alerts: Alert[];
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function AlertList({ alerts, onDelete, onToggle }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Alerts</h2>
        <p className="text-gray-500 text-center py-8">No alerts yet. Create your first alert!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Your Alerts <span className="text-sm font-normal text-gray-500">({alerts.length})</span>
      </h2>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border rounded-lg p-4 ${
              !alert.enabled ? 'bg-gray-100 border-gray-300 opacity-70' :
              alert.notified ? 'bg-yellow-50 border-yellow-200' :
              'bg-white border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-semibold ${!alert.enabled ? 'text-gray-500' : 'text-gray-900'}`}>
                    {alert.currency_pair}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      alert.direction === 'above'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {alert.direction === 'above' ? '↑ Above' : '↓ Below'}
                  </span>
                  <span className="font-mono text-sm text-gray-700">{alert.target_rate}</span>
                  {!alert.enabled && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded">
                      Disabled
                    </span>
                  )}
                  {alert.notified && alert.enabled && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-100 rounded">
                      Triggered
                    </span>
                  )}
                </div>

                {alert.last_rate && (
                  <p className="text-xs text-gray-500">
                    Last known rate: <span className="font-mono">{alert.last_rate.toFixed(4)}</span>
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Created: {new Date(alert.created_at).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onToggle(alert.id, alert.enabled)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    alert.enabled
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 border-gray-300'
                      : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-600'
                  }`}
                  title={alert.enabled ? 'Disable alert' : 'Enable alert'}
                >
                  {alert.enabled ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this alert?')) {
                      onDelete(alert.id);
                    }
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-600 transition-colors"
                  title="Delete alert"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
