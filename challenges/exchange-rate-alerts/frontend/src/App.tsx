import { useState, useEffect } from 'react';
import { ThemeProvider, CssBaseline, Container, Box, Typography } from '@mui/material';
import { Alert, Notification } from './types';
import { theme } from './theme';
import Modal from './components/Modal';
import AlertForm from './components/AlertForm';
import MyAlertsSection from './components/MyAlertsSection';
import NotificationsSection from './components/NotificationsSection';
import LiveRatesSection from './components/LiveRatesSection';
import AllAlertsPage from './pages/AllAlertsPage';
import AllAlertsCardPage from './pages/AllAlertsCardPage';
import AllNotificationsPage from './pages/AllNotificationsPage';

const API_URL = 'http://localhost:5000/api';

type Page = 'dashboard' | 'all-alerts' | 'all-alerts-cards' | 'all-notifications';

function App() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

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

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          setAlertError(errorData.error || 'An identical alert already exists');
        } else {
          setAlertError('Failed to create alert. Please try again.');
        }
        return;
      }

      if (response.ok) {
        await fetchAlerts();
        setIsModalOpen(false);
        setAlertError(null);
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      setAlertError('Failed to create alert. Please check your connection.');
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

  if (currentPage === 'all-alerts-cards') {
    return (
      <AllAlertsCardPage
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e293b 100%)' }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Exchange Rate Alerts
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor currency rates and get notified when targets are hit
            </Typography>
          </Box>

          {/* Three Section Layout - Horizontal */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
          {/* Notifications Section - Left */}
          <Box>
            <NotificationsSection
              notifications={notifications}
              onViewAllClick={() => setCurrentPage('all-notifications')}
              onAcknowledge={handleAcknowledgeNotification}
            />
          </Box>

          {/* Live Rates Section - Middle */}
          <Box>
            <LiveRatesSection />
          </Box>

          {/* My Alerts Section - Right */}
          <Box>
            <MyAlertsSection
              alerts={alerts}
              onCreateClick={() => setIsModalOpen(true)}
              onViewAllClick={() => setCurrentPage('all-alerts-cards')}
              onDelete={handleDeleteAlert}
              onToggle={handleToggleAlert}
            />
          </Box>
        </Box>

          {/* Create Alert Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setAlertError(null);
            }}
            title="Create New Alert"
          >
            <AlertForm
              onSubmit={handleCreateAlert}
              error={alertError}
              onClearError={() => setAlertError(null)}
            />
          </Modal>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
