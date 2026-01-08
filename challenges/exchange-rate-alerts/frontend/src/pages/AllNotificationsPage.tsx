import { Notification } from '../types';
import { Container, Typography, Box, Button, Card, CardContent, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, CheckCircle } from '@mui/icons-material';

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
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            All Notifications
          </Typography>
        </Box>

        <Card>
          <CardContent>
            {notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">No notifications yet</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {notifications.map((notification) => (
                  <Box
                    key={notification.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: notification.acknowledged ? 'divider' : 'warning.main',
                      bgcolor: notification.acknowledged ? 'background.paper' : 'rgba(245, 158, 11, 0.1)',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: notification.acknowledged ? 'primary.main' : 'warning.light',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: notification.acknowledged ? 400 : 700,
                            mb: 1
                          }}
                        >
                          {notification.message || 'Alert triggered'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Rate: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{notification.triggered_rate.toFixed(4)}</Box>
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          {(() => {
                            const date = new Date(notification.triggered_at);
                            date.setHours(date.getHours() - 5);
                            return date.toLocaleString();
                          })()}
                        </Typography>
                        {notification.acknowledged && notification.acknowledged_at && (
                          <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 0.5 }}>
                            Acknowledged: {(() => {
                              const date = new Date(notification.acknowledged_at);
                              date.setHours(date.getHours() - 5);
                              return date.toLocaleString();
                            })()}
                          </Typography>
                        )}
                      </Box>
                      {!notification.acknowledged && (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => onAcknowledge(notification.id)}
                          startIcon={<CheckCircle />}
                          sx={{ ml: 2 }}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
