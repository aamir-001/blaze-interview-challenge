import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Grid, Chip, Dialog, DialogTitle, DialogContent, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { ShowChart as ShowChartIcon, Close as CloseIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = 'http://localhost:5000/api';

interface RateHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface HistoricalData {
  pair: string;
  name: string;
  current: number;
  history: RateHistory[];
}

interface LiveRatesSectionProps {}

export default function LiveRatesSection({}: LiveRatesSectionProps) {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch(`${API_URL}/rates`);
        const data = await response.json();
        setRates(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch rates:', error);
        setLoading(false);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHistoricalData = async (pair: string) => {
    setLoadingHistory(true);
    try {
      const pairParam = pair.replace('/', '-');
      const response = await fetch(`${API_URL}/rates/${pairParam}/history`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePairClick = (pair: string) => {
    setSelectedPair(pair);
    fetchHistoricalData(pair);
  };

  const closeModal = () => {
    setSelectedPair(null);
    setHistoricalData(null);
  };

  const displayPairs = [
    { pair: 'USD/MXN', key: 'MXN' },
    { pair: 'USD/EUR', key: 'EUR' },
    { pair: 'USD/BRL', key: 'BRL' },
    { pair: 'USD/GBP', key: 'GBP' }
  ];

  return (
    <>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShowChartIcon color="primary" />
              <Typography variant="h6">Live Rates</Typography>
            </Box>
            <Chip label="Updates every 10s" size="small" variant="outlined" />
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading rates...</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {displayPairs.map(({ pair, key }) => (
                <Grid item xs={6} sm={4} key={pair}>
                  <Box
                    onClick={() => handlePairClick(pair)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {pair}
                    </Typography>
                    <Typography variant="h6" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {rates[key] ? rates[key].toFixed(4) : '-'}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Historical Data Modal */}
      <Dialog
        open={!!selectedPair}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedPair} Historical Data
          </Typography>
          <IconButton onClick={closeModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading historical data...</Typography>
            </Box>
          ) : historicalData ? (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {historicalData.name}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Current Rate: <Box component="span" sx={{ fontFamily: 'monospace' }}>{historicalData.current.toFixed(4)}</Box>
                </Typography>
              </Box>

              {/* Chart */}
              <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                <Line
                  data={{
                    labels: historicalData.history.map(row => new Date(row.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                    datasets: [
                      {
                        label: 'Close Price',
                        data: historicalData.history.map(row => row.close),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#3b82f6',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 2,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        borderColor: '#3b82f6',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return `Rate: ${context.parsed.y.toFixed(4)}`;
                          }
                        }
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          color: 'rgba(148, 163, 184, 0.1)',
                        },
                        ticks: {
                          color: '#94a3b8',
                        },
                      },
                      y: {
                        grid: {
                          color: 'rgba(148, 163, 184, 0.1)',
                        },
                        ticks: {
                          color: '#94a3b8',
                          callback: function(value) {
                            return value.toFixed(4);
                          }
                        },
                      },
                    },
                  }}
                />
              </Box>

              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Open</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>High</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Low</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Close</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicalData.history.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(row.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {row.open.toFixed(4)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'success.main' }}>
                          {row.high.toFixed(4)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'error.main' }}>
                          {row.low.toFixed(4)}
                        </TableCell>
                        <TableCell align="right" sx={{ fontFamily: 'monospace' }}>
                          {row.close.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Failed to load historical data</Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
