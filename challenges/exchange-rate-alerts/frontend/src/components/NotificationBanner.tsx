import { Notification } from '../types';

interface NotificationBannerProps {
  notifications: Notification[];
  onAcknowledge: (id: number) => Promise<void>;
}

export default function NotificationBanner({ notifications, onAcknowledge }: NotificationBannerProps) {
  const unacknowledged = notifications.filter(n => !n.acknowledged);

  if (unacknowledged.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2">
      {unacknowledged.map((notification) => (
        <div
          key={notification.id}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-yellow-800 font-medium">Alert Triggered!</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1 font-medium">
                {notification.message || 'Price alert triggered'}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Current rate: <span className="font-mono font-semibold">{notification.triggered_rate.toFixed(4)}</span>
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onAcknowledge(notification.id)}
              className="ml-4 px-3 py-1 text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
