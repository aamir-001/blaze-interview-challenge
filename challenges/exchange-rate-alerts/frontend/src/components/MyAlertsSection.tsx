import { Alert } from '../types';
import { Card, CardContent, Typography, Box, Button, Chip, IconButton } from '@mui/material';
import { NotificationAdd as NotificationAddIcon, Delete as DeleteIcon, ToggleOff, ToggleOn } from '@mui/icons-material';

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
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationAddIcon color="primary" />
            <Typography variant="h6">My Alerts</Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={onCreateClick}
            sx={{ textTransform: 'none' }}
          >
            Create Alert
          </Button>
        </Box>

        {alerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary" gutterBottom>No alerts yet</Typography>
            <Button onClick={onCreateClick} variant="text" sx={{ mt: 1 }}>
              Create your first alert
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {recentAlerts.map((alert) => (
                <Box
                  key={alert.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: !alert.enabled ? 'divider' : alert.notified ? 'warning.main' : 'divider',
                    bgcolor: !alert.enabled ? 'action.disabledBackground' : alert.notified ? 'rgba(245, 158, 11, 0.1)' : 'background.paper',
                    opacity: !alert.enabled ? 0.6 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: !alert.enabled ? 'text.disabled' : 'text.primary'
                          }}
                        >
                          {alert.currency_pair}
                        </Typography>
                        <Chip
                          label={`${alert.direction === 'above' ? '↑' : '↓'} ${alert.target_rate}`}
                          size="small"
                          color={alert.direction === 'above' ? 'success' : 'error'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                        {!alert.enabled && (
                          <Chip
                            label="Disabled"
                            size="small"
                            sx={{ height: 20, fontSize: '0.7rem', bgcolor: 'action.disabledBackground' }}
                          />
                        )}
                        {alert.notified && alert.enabled && (
                          <Chip
                            label="Triggered"
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                      {alert.last_known_rate && (
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {(() => {
                            const distance = Math.abs(((alert.last_known_rate - alert.target_rate) / alert.target_rate) * 100);
                            const isAboveTarget = alert.last_known_rate > alert.target_rate;
                            const reachedTarget = (alert.direction === 'above' && isAboveTarget) ||
                                                 (alert.direction === 'below' && !isAboveTarget);
                            return (
                              <Box
                                component="span"
                                sx={{
                                  fontWeight: 600,
                                  color: reachedTarget ? 'warning.main' : 'info.main'
                                }}
                              >
                                {reachedTarget ? '✓ Reached' : `${distance.toFixed(1)}% away`}
                              </Box>
                            );
                          })()}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onToggle(alert.id, alert.enabled)}
                        color={alert.enabled ? 'default' : 'primary'}
                        sx={{ padding: 0.5 }}
                      >
                        {alert.enabled ? <ToggleOn fontSize="small" /> : <ToggleOff fontSize="small" />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          if (confirm('Delete this alert?')) {
                            onDelete(alert.id);
                          }
                        }}
                        color="error"
                        sx={{ padding: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {alerts.length > 0 && (
              <Button
                fullWidth
                onClick={onViewAllClick}
                sx={{ mt: 2 }}
                variant="outlined"
              >
                View All Alerts ({alerts.length})
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
