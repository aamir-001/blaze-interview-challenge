import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize SQLite database
const dbPath = path.join(__dirname, '../../exchange-rate-alerts.db');
export const db: DatabaseType = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initializeDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create alerts table with composite unique constraint
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      currency_pair TEXT NOT NULL,
      target_rate REAL NOT NULL CHECK(target_rate > 0),
      direction TEXT NOT NULL CHECK(direction IN ('above', 'below')),
      enabled BOOLEAN NOT NULL DEFAULT 1,
      notified BOOLEAN NOT NULL DEFAULT 0,
      last_known_rate REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

      UNIQUE(user_id, currency_pair, target_rate, direction),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id INTEGER NOT NULL,
      triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      triggered_rate REAL NOT NULL,
      message TEXT,
      acknowledged BOOLEAN NOT NULL DEFAULT 0,
      acknowledged_at TIMESTAMP,

      FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_alerts_enabled
    ON alerts(enabled) WHERE enabled = 1
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_alert_id
    ON notifications(alert_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_notifications_acknowledged
    ON notifications(acknowledged)
  `);

  // Add message column to notifications if it doesn't exist (migration)
  const tableInfo = db.prepare('PRAGMA table_info(notifications)').all() as any[];
  const hasMessageColumn = tableInfo.some((col: any) => col.name === 'message');
  if (!hasMessageColumn) {
    db.exec('ALTER TABLE notifications ADD COLUMN message TEXT');
    console.log('✅ Added message column to notifications table');
  }

  // Register dummy user with id = 1
  const userExists = db.prepare('SELECT id FROM users WHERE id = 1').get();
  if (!userExists) {
    db.prepare('INSERT INTO users (id, name) VALUES (1, ?)').run('Demo User');
    console.log('✅ Dummy user registered with ID: 1');
  }

  console.log('✅ Database initialized successfully');
}

// Close database connection
export function closeDatabase() {
  db.close();
}
