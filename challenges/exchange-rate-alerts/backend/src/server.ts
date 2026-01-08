import express from 'express';
import cors from 'cors';
import { initializeDatabase, closeDatabase } from './database/db.js';
import { startRateChecker } from './workers/rateChecker.js';
import ratesRouter from './routes/rates.js';
import alertsRouter from './routes/alerts.js';
import notificationsRouter from './routes/notifications.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/api/rates', ratesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/notifications', notificationsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Exchange Rate Alerts API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET    http://localhost:${PORT}/api/rates`);
  console.log(`   - GET    http://localhost:${PORT}/api/rates/:pair/history`);
  console.log(`   - GET    http://localhost:${PORT}/api/alerts`);
  console.log(`   - POST   http://localhost:${PORT}/api/alerts`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/alerts/:id`);
  console.log(`   - DELETE http://localhost:${PORT}/api/alerts/:id`);
  console.log(`   - GET    http://localhost:${PORT}/api/notifications`);
  console.log(`   - PATCH  http://localhost:${PORT}/api/notifications/:id/acknowledge\n`);

  // Start background rate checker
  startRateChecker();
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  closeDatabase();
  process.exit(0);
});
