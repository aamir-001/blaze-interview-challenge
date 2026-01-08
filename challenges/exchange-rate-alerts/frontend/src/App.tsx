import { useState, useEffect } from 'react';
import { Alert, Notification } from './types';
import Modal from './components/Modal';
import AlertForm from './components/AlertForm';
import NotificationBanner from './components/NotificationBanner';
import MyAlertsSection from './components/MyAlertsSection';
import NotificationsSection from './components/NotificationsSection';
import LiveRatesSection from './components/LiveRatesSection';
import AllAlertsPage from './pages/AllAlertsPage';
import AllNotificationsPage from './pages/AllNotificationsPage';

const API_URL = 'http://localhost:5000/api';

type Page = 'dashboard' | 'all-alerts' | 'all-notifications';

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchAlerts(), fetchNotifications()]);
      setLoading(false);
    };
    loadData();

    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      fetchAlerts();
      fetchNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateAlert = async (alertData: Omit<Alert, 'id' | 'notified' | 'created_at'>) => {
    try {
      const response = await fetch(`${API_URL}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      if (response.ok) {
        await fetchAlerts();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const handleToggleAlert = async (id: number, currentEnabled: boolean) => {
    try {
      const response = await fetch(`${API_URL}/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !currentEnabled }),
      });
      if (response.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to toggle alert:', error);
    }
  };

  const handleAcknowledgeNotification = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/acknowledge`, {
        method: 'PATCH',
      });
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Render different pages based on current page
  if (currentPage === 'all-alerts') {
    return (
      <AllAlertsPage
        alerts={alerts}
        onBack={() => setCurrentPage('dashboard')}
        onDelete={handleDeleteAlert}
        onToggle={handleToggleAlert}
      />
    );
  }

  if (currentPage === 'all-notifications') {
    return (
      <AllNotificationsPage
        notifications={notifications}
        onBack={() => setCurrentPage('dashboard')}
        onAcknowledge={handleAcknowledgeNotification}
      />
    );
  }

  // Dashboard page
  const unacknowledgedNotifications = notifications.filter(n => !n.acknowledged);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Exchange Rate Alerts</h1>
          <p className="text-gray-600 mt-2">Monitor currency rates and get notified when targets are hit</p>
        </header>

        {/* Alert Banner for unacknowledged notifications */}
        <NotificationBanner
          notifications={unacknowledgedNotifications}
          onAcknowledge={handleAcknowledgeNotification}
        />

        {/* Three Section Layout - Horizontal */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* Notifications Section - Left */}
          <div>
            <NotificationsSection
              notifications={notifications}
              onViewAllClick={() => setCurrentPage('all-notifications')}
              onAcknowledge={handleAcknowledgeNotification}
            />
          </div>

          {/* Live Rates Section - Middle */}
          <div>
            <LiveRatesSection />
          </div>

          {/* My Alerts Section - Right */}
          <div>
            <MyAlertsSection
              alerts={alerts}
              onCreateClick={() => setIsModalOpen(true)}
              onViewAllClick={() => setCurrentPage('all-alerts')}
              onDelete={handleDeleteAlert}
              onToggle={handleToggleAlert}
            />
          </div>
        </div>

        {/* Create Alert Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Alert"
        >
          <AlertForm onSubmit={handleCreateAlert} />
        </Modal>
      </div>
    </div>
  );
}

export default App;
