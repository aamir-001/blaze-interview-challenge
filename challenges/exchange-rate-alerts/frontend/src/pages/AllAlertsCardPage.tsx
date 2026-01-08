import { Alert } from '../types';
import { Container, Typography, Box, Button, Grid, Card, CardContent, Chip, IconButton, Divider } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, ToggleOn, ToggleOff } from '@mui/icons-material';

interface AllAlertsCardPageProps {
  alerts: Alert[];
  onBack: () => void;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function AllAlertsCardPage({ alerts, onBack, onDelete, onToggle }: AllAlertsCardPageProps) {
  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            All Alerts
          </Typography>
          <Typography color="text.secondary">
            Manage all your exchange rate alerts
          </Typography>
        </Box>

        {alerts.length === 0 ? (
          <Card>
            <CardContent sx={{ py: 8, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="h6">
                No alerts yet. Create your first alert!
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {alerts.map((alert) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={alert.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: !alert.enabled ? 'divider' : alert.notified ? 'warning.main' : 'divider',
                    borderWidth: 1,
                    borderStyle: 'solid',
                    bgcolor: !alert.enabled ? 'action.disabledBackground' : alert.notified ? 'rgba(245, 158, 11, 0.1)' : 'background.paper',
                    opacity: !alert.enabled ? 0.7 : 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Alert Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          color: !alert.enabled ? 'text.disabled' : 'text.primary'
                        }}
                      >
                        {alert.currency_pair}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={alert.direction === 'above' ? '↑ Above' : '↓ Below'}
                          size="small"
                          color={alert.direction === 'above' ? 'success' : 'error'}
                        />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {alert.target_rate}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status Badges */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {!alert.enabled && (
                        <Chip
                          label="Disabled"
                          size="small"
                          sx={{ bgcolor: 'action.disabledBackground' }}
                        />
                      )}
                      {alert.notified && alert.enabled && (
                        <Chip
                          label="Triggered"
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>

                    {/* Alert Info */}
                    <Box sx={{ mb: 2, flex: 1 }}>
                      {alert.last_known_rate && (
                        <>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Current: <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{alert.last_known_rate.toFixed(4)}</Box>
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
                                {reachedTarget ? '✓ Target reached' : `${distance.toFixed(1)}% away`}
                              </Typography>
                            );
                          })()}
                        </>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        Created: {new Date(alert.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>

                    {/* Actions */}
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        fullWidth
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
                          if (confirm(`Delete alert for ${alert.currency_pair}?`)) {
                            onDelete(alert.id);
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
