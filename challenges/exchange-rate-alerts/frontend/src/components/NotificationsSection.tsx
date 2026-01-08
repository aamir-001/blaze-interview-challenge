import { Notification } from '../types';

interface NotificationsSectionProps {
  notifications: Notification[];
  onViewAllClick: () => void;
  onAcknowledge: (id: number) => Promise<void>;
}

export default function NotificationsSection({
  notifications,
  onViewAllClick,
  onAcknowledge
}: NotificationsSectionProps) {
  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Recent Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-3 ${
                  notification.acknowledged
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.message || 'Alert triggered'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rate: {notification.triggered_rate.toFixed(4)} • {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(notification.id)}
                      className="ml-2 text-xs text-blue-600 hover:underline"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onViewAllClick}
            className="mt-4 w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Notifications ({notifications.length})
          </button>
        </>
      )}
    </div>
  );
}
