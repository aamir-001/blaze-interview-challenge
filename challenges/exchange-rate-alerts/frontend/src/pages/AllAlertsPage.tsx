import { Alert } from '../types';
import AlertList from '../components/AlertList';
import { Container, Typography, Box, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface AllAlertsPageProps {
  alerts: Alert[];
  onBack: () => void;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number, currentEnabled: boolean) => Promise<void>;
}

export default function AllAlertsPage({ alerts, onBack, onDelete, onToggle }: AllAlertsPageProps) {
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
            All Alerts
          </Typography>
        </Box>

        <AlertList alerts={alerts} onDelete={onDelete} onToggle={onToggle} />
      </Container>
    </Box>
  );
}
