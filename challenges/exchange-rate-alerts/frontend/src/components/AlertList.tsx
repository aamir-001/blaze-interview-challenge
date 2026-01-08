import { Alert } from '../types';
import { Card, CardContent, Typography, Box, Button, Chip, IconButton } from '@mui/material';
import { Delete as DeleteIcon, ToggleOn, ToggleOff } from '@mui/icons-material';

interface AlertListProps {
  alerts: Alert[];
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function AlertList({ alerts, onDelete, onToggle }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Your Alerts</Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">No alerts yet. Create your first alert!</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Your Alerts <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 400, color: 'text.secondary' }}>({alerts.length})</Box>
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {alerts.map((alert) => (
            <Box
              key={alert.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: !alert.enabled ? 'divider' : alert.notified ? 'warning.main' : 'divider',
                bgcolor: !alert.enabled ? 'action.disabledBackground' : alert.notified ? 'rgba(245, 158, 11, 0.1)' : 'background.paper',
                opacity: !alert.enabled ? 0.7 : 1,
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 600,
                        color: !alert.enabled ? 'text.disabled' : 'text.primary'
                      }}
                    >
                      {alert.currency_pair}
                    </Typography>
                    <Chip
                      label={alert.direction === 'above' ? '↑ Above' : '↓ Below'}
                      size="small"
                      color={alert.direction === 'above' ? 'success' : 'error'}
                      sx={{ height: 22 }}
                    />
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {alert.target_rate}
                    </Typography>
                    {!alert.enabled && (
                      <Chip
                        label="Disabled"
                        size="small"
                        sx={{ height: 22, bgcolor: 'action.disabledBackground' }}
                      />
                    )}
                    {alert.notified && alert.enabled && (
                      <Chip
                        label="Triggered"
                        size="small"
                        color="warning"
                        sx={{ height: 22 }}
                      />
                    )}
                  </Box>

                  {alert.last_known_rate && (
                    <>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Current rate: <Box component="span" sx={{ fontFamily: 'monospace' }}>{alert.last_known_rate.toFixed(4)}</Box>
                      </Typography>
                      {(() => {
                        const distance = Math.abs(((alert.last_known_rate - alert.target_rate) / alert.target_rate) * 100);
                        const isAboveTarget = alert.last_known_rate > alert.target_rate;
                        const reachedTarget = (alert.direction === 'above' && isAboveTarget) ||
                                             (alert.direction === 'below' && !isAboveTarget);
                        return (
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              color: reachedTarget ? 'warning.main' : 'info.main',
                              display: 'block'
                            }}
                          >
                            {reachedTarget ? '✓ Target reached' : `${distance.toFixed(1)}% away from target`}
                          </Typography>
                        );
                      })()}
                    </>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    Created: {new Date(alert.created_at).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                  <Button
                    size="small"
                    variant={alert.enabled ? 'outlined' : 'contained'}
                    onClick={() => onToggle(alert.id, alert.enabled)}
                    startIcon={alert.enabled ? <ToggleOn /> : <ToggleOff />}
                  >
                    {alert.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (confirm('Delete this alert?')) {
                        onDelete(alert.id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
