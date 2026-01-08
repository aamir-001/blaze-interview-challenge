import { Notification } from '../types';
import { Card, CardContent, Typography, Box, Button, Chip, IconButton } from '@mui/material';
import { Notifications as NotificationsIcon, CheckCircle } from '@mui/icons-material';

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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Recent Notifications</Typography>
          </Box>
        </Box>

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No notifications yet</Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {recentNotifications.map((notification) => (
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
                        variant="body2"
                        sx={{
                          fontWeight: notification.acknowledged ? 400 : 700,
                          mb: 0.5
                        }}
                      >
                        {notification.message || 'Alert triggered'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rate: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{notification.triggered_rate.toFixed(4)}</Box>
                        {' • '}
                        {new Date(notification.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {!notification.acknowledged && (
                      <IconButton
                        size="small"
                        onClick={() => onAcknowledge(notification.id)}
                        sx={{ ml: 1 }}
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            <Button
              fullWidth
              onClick={onViewAllClick}
              sx={{ mt: 2 }}
              variant="outlined"
            >
              View All Notifications ({notifications.length})
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
