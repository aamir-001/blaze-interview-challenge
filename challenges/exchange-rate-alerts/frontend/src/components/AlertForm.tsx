import { useState, FormEvent } from 'react';
import { CURRENCY_PAIRS, Alert } from '../types';
import { Card, CardContent, Typography, Box, TextField, MenuItem, Button, Alert as MuiAlert } from '@mui/material';
import { NotificationAdd as NotificationAddIcon } from '@mui/icons-material';

interface AlertFormProps {
  onSubmit: (alert: Omit<Alert, 'id' | 'notified' | 'created_at'>) => Promise<void>;
  error?: string | null;
  onClearError?: () => void;
}

export default function AlertForm({ onSubmit, error, onClearError }: AlertFormProps) {
  const [currencyPair, setCurrencyPair] = useState(CURRENCY_PAIRS[0]);
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [targetRate, setTargetRate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!targetRate || isNaN(Number(targetRate)) || Number(targetRate) <= 0) {
      alert('Please enter a valid target rate');
      return;
    }

    if (onClearError) {
      onClearError();
    }

    setSubmitting(true);
    try {
      await onSubmit({
        currency_pair: currencyPair,
        direction,
        target_rate: Number(targetRate),
      });
      setTargetRate('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <NotificationAddIcon color="primary" />
          <Typography variant="h6">Create New Alert</Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {error && (
            <MuiAlert severity="error" onClose={onClearError}>
              {error}
            </MuiAlert>
          )}

          <TextField
            select
            label="Currency Pair"
            value={currencyPair}
            onChange={(e) => setCurrencyPair(e.target.value)}
            fullWidth
          >
            {CURRENCY_PAIRS.map((pair) => (
              <MenuItem key={pair} value={pair}>
                {pair}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Alert When Rate Goes"
            value={direction}
            onChange={(e) => setDirection(e.target.value as 'above' | 'below')}
            fullWidth
          >
            <MenuItem value="above">Above</MenuItem>
            <MenuItem value="below">Below</MenuItem>
          </TextField>

          <TextField
            label="Target Rate"
            type="number"
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            placeholder="e.g., 1.2500"
            fullWidth
            required
            inputProps={{
              step: '0.0001',
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={submitting}
            fullWidth
          >
            {submitting ? 'Creating...' : 'Create Alert'}
          </Button>
        </Box>

        <MuiAlert severity="info" sx={{ mt: 3 }}>
          <Typography variant="caption">
            <strong>Preview:</strong> Alert me when {currencyPair} goes{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>{direction}</Box>{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>{targetRate || '___'}</Box>
          </Typography>
        </MuiAlert>
      </CardContent>
    </Card>
  );
}
