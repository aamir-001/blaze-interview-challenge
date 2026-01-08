import { Notification } from '../types';

interface AllNotificationsPageProps {
  notifications: Notification[];
  onBack: () => void;
  onAcknowledge: (id: number) => Promise<void>;
}

export default function AllNotificationsPage({
  notifications,
  onBack,
  onAcknowledge
}: AllNotificationsPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-medium mb-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 ${
                    notification.acknowledged
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {notification.message || 'Alert triggered'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Rate: <span className="font-mono">{notification.triggered_rate.toFixed(4)}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                      {notification.acknowledged && notification.acknowledged_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          Acknowledged: {new Date(notification.acknowledged_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {!notification.acknowledged && (
                      <button
                        onClick={() => onAcknowledge(notification.id)}
                        className="ml-4 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
