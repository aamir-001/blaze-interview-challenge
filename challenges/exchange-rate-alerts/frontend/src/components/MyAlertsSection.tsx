import { Alert } from '../types';

interface MyAlertsSectionProps {
  alerts: Alert[];
  onCreateClick: () => void;
  onViewAllClick: () => void;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function MyAlertsSection({
  alerts,
  onCreateClick,
  onViewAllClick,
  onDelete,
  onToggle
}: MyAlertsSectionProps) {
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">My Alerts</h2>
        <button
          onClick={onCreateClick}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          Create Alert
        </button>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No alerts yet</p>
          <button
            onClick={onCreateClick}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first alert
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-3 ${
                  !alert.enabled ? 'bg-gray-100 border-gray-300 opacity-60' :
                  alert.notified ? 'bg-yellow-50 border-yellow-200' :
                  'bg-white border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                      {alert.direction === 'above' ? '↑' : '↓'} {alert.target_rate}
                    </span>
                    {!alert.enabled && (
                      <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded">
                        Disabled
                      </span>
                    )}
                    {alert.notified && alert.enabled && (
                      <span className="text-xs text-orange-700 bg-orange-100 px-2 py-0.5 rounded">
                        Triggered
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onToggle(alert.id, alert.enabled)}
                      className={`text-xs px-2 py-1 rounded ${
                        alert.enabled
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {alert.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this alert?')) {
                          onDelete(alert.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {alerts.length > 3 && (
            <button
              onClick={onViewAllClick}
              className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Alerts ({alerts.length})
            </button>
          )}
        </>
      )}
    </div>
  );
}
