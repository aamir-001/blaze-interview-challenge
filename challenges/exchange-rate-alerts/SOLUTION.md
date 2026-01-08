# Solution

## Overview

This is a full-stack exchange rate alert system that allows users to monitor currency pairs and receive notifications when rates reach their target thresholds. The system polls the Blaze API every 5 seconds, checks enabled alerts, and triggers notifications with smart reset logic to handle rate volatility.

## Architecture

### System Components

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React UI      │ ◄─────► │  Express API     │ ◄─────► │  Blaze API      │
│  (Port 3000)    │         │  (Port 5000)     │         │ (External)      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │   SQLite DB      │
                            │  (Persistent)    │
                            └──────────────────┘
                                     ▲
                                     │
                            ┌──────────────────┐
                            │  Rate Checker    │
                            │  (Cron Worker)   │
                            │  Every 5 seconds │
                            └──────────────────┘
```

### Data Flow

1. **Frontend → Backend:** User creates alerts via REST API
2. **Backend → Database:** Alerts stored with unique constraints
3. **Rate Checker (Background):**
   - Polls Blaze API every 5 seconds
   - Queries enabled alerts from database
   - Compares current rates against target rates
   - Creates notifications when thresholds are met or crossed
   - Resets alerts when prices return to safe side
4. **Backend → Frontend:** Polls every 10 seconds for updates (alerts, notifications, rates)

## Tech Stack Choices

### Frontend
- **React 19** - Latest version with improved performance
- **TypeScript** - Type safety for currency/rate data
- **Material-UI 7** - Professional component library with dark theme
- **Chart.js** - Lightweight charting for historical rates
- **Vite** - Fast build tool and dev server

### Backend
- **Node.js + Express 5** - Familiar, fast, good for real-time polling
- **TypeScript** - Type safety across full stack
- **better-sqlite3** - Synchronous SQLite driver, simpler than async for this use case
- **node-cron** - Scheduled rate checking worker

### Database
- **SQLite** - Perfect for single-user demo, zero configuration, file-based persistence

### Charts
- **react-chartjs-2** - React wrapper for Chart.js
- **Line charts** - Show 7-day historical trends with OHLC data

## Database Models

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```
- Simple user model with hardcoded demo user (ID=1)
- Supports multi-user architecture for future expansion

### Alerts Table
```sql
CREATE TABLE alerts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  currency_pair TEXT NOT NULL,        -- e.g., "USD/MXN"
  target_rate REAL NOT NULL CHECK(target_rate > 0),
  direction TEXT NOT NULL CHECK(direction IN ('above', 'below')),
  enabled BOOLEAN NOT NULL DEFAULT 1,
  notified BOOLEAN NOT NULL DEFAULT 0, -- Tracks if alert has triggered
  last_known_rate REAL,                -- Cached current rate
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  UNIQUE(user_id, currency_pair, target_rate, direction),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

**Key Fields:**
- `notified` - Boolean flag indicating if alert has triggered (prevents duplicate notifications)
- `last_known_rate` - Caches the most recent rate for distance calculations
- `enabled` - Allows users to pause alerts without deleting them
- **UNIQUE constraint** - Prevents duplicate alerts for same conditions

### Notifications Table
```sql
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  alert_id INTEGER NOT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  triggered_rate REAL NOT NULL,       -- Rate when alert triggered
  message TEXT,                        -- Human-readable message
  acknowledged BOOLEAN NOT NULL DEFAULT 0,
  acknowledged_at TIMESTAMP,

  FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
)
```

**Key Fields:**
- `message` - Descriptive message like "USD/MXN crossed above 17.25"
- `triggered_rate` - Actual rate when notification was created
- `acknowledged` - Allows users to mark notifications as read

## Alert Lifecycle & Notification Logic

### When We Send a Notification

A notification is created when **ALL** conditions are met:

1. ✅ Alert is **enabled** (`enabled = 1`)
2. ✅ Alert has **not yet triggered** (`notified = 0`)
3. ✅ Threshold condition is met:
   - **Direction "above":** `currentRate >= targetRate`
   - **Direction "below":** `currentRate <= targetRate`

**Action:** Create notification + Set `notified = 1`

**Code:** [rateChecker.ts:80-89](backend/src/workers/rateChecker.ts#L80-L89)

### When We Reset an Alert

An alert is reset (allowed to re-trigger) when:

1. ✅ Alert is **enabled** (`enabled = 1`)
2. ✅ Alert has **already triggered** (`notified = 1`)
3. ✅ Price has crossed back to "safe side":
   - **Direction "above":** `currentRate < targetRate` (dropped back below)
   - **Direction "below":** `currentRate > targetRate` (rose back above)

**Action:** Set `notified = 0`

**Code:** [rateChecker.ts:73-76](backend/src/workers/rateChecker.ts#L73-L76)

### Example Scenario

```
Alert: USD/MXN goes above 17.50 (direction: 'above')

┌────────────────┬──────────────┬──────────┬───────────────────────┐
│ Current Rate   │ notified     │ Action   │ Explanation           │
├────────────────┼──────────────┼──────────┼───────────────────────┤
│ 17.30          │ false        │ Nothing  │ Below target          │
│ 17.60          │ false        │ TRIGGER  │ Crossed above → Notify│
│ 17.65          │ true         │ Nothing  │ Already notified      │
│ 17.55          │ true         │ Nothing  │ Still above target    │
│ 17.45          │ true         │ RESET    │ Dropped below → Reset │
│ 17.70          │ false        │ TRIGGER  │ Can re-trigger now    │
└────────────────┴──────────────┴──────────┴───────────────────────┘
```

This prevents **spam notifications** during volatile periods while still allowing alerts to **re-trigger** after corrections.

## Key Design Decisions

### 1. Smart Alert Reset Logic
**Decision:** Alerts can re-trigger after price crosses back to safe side

**Rationale:**
- Prevents one-time-only alerts (better UX)
- Handles rate volatility gracefully
- Users don't need to recreate alerts after each trigger

**Tradeoff:** Slightly more complex logic, but much better user experience

### 2. `notified` Flag Instead of Auto-Disable
**Decision:** Use a `notified` boolean flag to track trigger state instead of disabling the alert

**Rationale:**
- Allows alerts to re-trigger (see #1)
- Users maintain control (can manually disable if desired)
- Simpler state management (enabled vs triggered are different concepts)

**Alternative Considered:** Auto-disable after trigger (as suggested in README) - rejected because it requires re-enabling alerts

### 3. In-Memory Rate Cache with Fallback
**Decision:** Cache successful API responses in memory, use as fallback on API failure

**Rationale:**
- Blaze API could be temporarily unavailable
- Stale data is better than no data for monitoring
- Logs cache age for transparency

**Implementation:** [rateService.ts:19-59](backend/src/services/rateService.ts#L19-L59)

### 4. Composite Unique Constraint on Alerts
**Decision:** `UNIQUE(user_id, currency_pair, target_rate, direction)`

**Rationale:**
- Prevents duplicate alerts (edge case #3)
- Re-enables disabled duplicates instead of erroring (smart UX)
- Enforces data integrity at database level

**Implementation:** [alertService.ts:44-56](backend/src/services/alertService.ts#L44-L56)

### 5. Frontend Polling vs WebSockets
**Decision:** Use polling (10-second intervals) instead of WebSockets/SSE

**Rationale:**
- Simpler implementation for demo scope
- 10-second latency is acceptable for rate alerts
- No persistent connection management needed
- Works through all proxy/firewall configurations

**Tradeoff:** Slightly higher latency and bandwidth vs real-time updates

### 6. Atomic Notification Creation
**Decision:** Create notification and update alert in a single transaction

**Rationale:**
- Ensures data consistency (notification always paired with notified=true)
- Prevents race conditions if multiple rate checks run simultaneously
- Proper use of database ACID properties

**Implementation:** [notificationService.ts:37-52](backend/src/services/notificationService.ts#L37-L52)

### 7. Material-UI Dark Theme
**Decision:** Custom dark blue-gray theme instead of default MUI theme

**Rationale:**
- Financial/dashboard apps often use dark themes (less eye strain)
- Professional appearance
- Better contrast for rate numbers

**Implementation:** [theme.ts](frontend/src/theme.ts)

## Edge Cases Handled

- ✅ **Rate volatility** - `notified` flag prevents duplicate notifications; reset logic allows re-triggering
- ✅ **Invalid targets** - Database CHECK constraint ensures `target_rate > 0`; frontend validates positive decimals
- ✅ **Duplicate alerts** - UNIQUE constraint prevents duplicates;
- ✅ **Disabled alerts don't trigger** - Rate checker queries `WHERE enabled = 1` only
- ✅ **Rate gaps** - Uses `>=` and `<=` (not exact match) so gaps are caught
- ✅ **API failures** - In-memory cache fallback with age tracking and logging

## API Documentation

### Rates
```
GET  /api/rates                    → Fetch current exchange rates from Blaze API
GET  /api/rates/:pair/history      → Get historical OHLC data (from mock-rates.json)
```

### Alerts
```
GET    /api/alerts                 → Get all user alerts with computed status
POST   /api/alerts                 → Create new alert (prevents duplicates)
PATCH  /api/alerts/:id             → Enable/disable alert
DELETE /api/alerts/:id             → Delete alert
```

### Notifications
```
GET   /api/notifications           → Get all notifications for user's alerts
PATCH /api/notifications/:id/acknowledge → Mark notification as read
```

## What I Would Improve

All core functionalities are fully implemented and working. Given more time, I would focus on improving the UI and design of the application:

### UI/UX Enhancements

1. **More Polished Animations**
   - Smooth transitions when alerts trigger
   - Confetti or celebratory animation when rate target is hit
   - Loading skeletons instead of plain "Loading..." text
   - Micro-interactions on hover/click for better feedback

2. **Responsive Design Improvements**
   - Better mobile layout (currently optimized for desktop)
   - Bottom navigation for mobile devices
   - Swipe gestures for deleting alerts on touch devices
   - Collapsible sections on smaller screens

3. **Data Visualization**
   - More interactive charts with zoom/pan capabilities
   - Sparkline mini-charts in alert cards showing recent trend
   - Real-time rate change indicators (green/red arrows)
   - Candlestick charts for advanced users

4. **Better Visual Hierarchy**
   - More whitespace and improved spacing
   - Clearer typography scale
   - Better color coding for different alert states
   - Icon system for quick visual recognition

5. **Enhanced User Feedback**
   - Toast notifications for actions (alert created, deleted, etc.)
   - Progress indicators for background operations
   - Empty states with illustrations
   - Better error state designs with actionable suggestions

6. **Dashboard Customization**
   - Drag-and-drop to rearrange sections
   - Collapsible panels for cleaner view
   - Dark/light theme toggle
   - Customizable color themes

7. **Accessibility Improvements**
   - ARIA labels for screen readers
   - Keyboard navigation support
   - High contrast mode
   - Focus indicators for all interactive elements

## How to Run

### Prerequisites
- Node.js 18+ and npm

### Installation & Setup

```bash
# Clone the repository
git clone <repo-url>
cd exchange-rate-alerts

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
# Rate checker starts automatically
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# UI runs on http://localhost:3000
```

#### Option 2: Build and Run Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

### Verify It's Working

1. Open http://localhost:3000 in your browser
2. You should see the dashboard with live rates
3. Create a test alert (e.g., USD/EUR above 0.9200)
4. Watch the console logs in the backend terminal:
   ```
   ✅ Rate checker started (runs every 30 seconds)
   Checking 1 enabled alert(s)...
   ```
5. If the rate crosses your threshold, you'll see:
   ```
   🔔 Alert #1 triggered! USD/EUR crossed above 0.9200 (current: 0.9215)
   ```
6. Check the Notifications section in the UI for the alert

### Configuration

**Backend Rate Source** ([rateService.ts:12](backend/src/services/rateService.ts#L12)):
```typescript
const RATE_SOURCE: 0 | 1 = 1;  // 1 = Live Blaze API, 0 = dummy-rates.json
```

**Rate Checker Frequency** ([rateChecker.ts:110](backend/src/workers/rateChecker.ts#L110)):
```typescript
cron.schedule('*/5 * * * * *', () => {  // Every 5 seconds
  checkAlerts();
});
```

**Frontend Polling Interval** ([App.tsx](frontend/src/App.tsx)):
```typescript
const interval = setInterval(fetchData, 10000);  // Every 10 seconds
```

## Project Structure

```
exchange-rate-alerts/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   └── db.ts              # Schema & initialization
│   │   ├── routes/
│   │   │   ├── alerts.ts          # Alert endpoints
│   │   │   ├── notifications.ts   # Notification endpoints
│   │   │   └── rates.ts           # Rate endpoints
│   │   ├── services/
│   │   │   ├── alertService.ts    # Alert business logic
│   │   │   ├── notificationService.ts
│   │   │   └── rateService.ts     # Blaze API integration
│   │   ├── workers/
│   │   │   └── rateChecker.ts     # Background cron job
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript definitions
│   │   └── server.ts              # Express app entry
│   ├── mock-rates.json            # Historical data for charts
│   ├── dummy-rates.json           # Fallback rate data
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AlertForm.tsx      # Create alert form
│   │   │   ├── LiveRatesSection.tsx
│   │   │   ├── MyAlertsSection.tsx
│   │   │   ├── NotificationsSection.tsx
│   │   │   └── Modal.tsx
│   │   ├── pages/
│   │   │   ├── AllAlertsPage.tsx  # Table view
│   │   │   ├── AllAlertsCardPage.tsx  # Grid view
│   │   │   └── AllNotificationsPage.tsx
│   │   ├── types.ts               # TypeScript definitions
│   │   ├── theme.ts               # MUI dark theme
│   │   └── App.tsx                # Main app & routing
│   └── package.json
│
├── README.md                      # Project requirements
├── SOLUTION.md                    # This file
└── AI_USAGE.md                    # AI assistance documentation
```

## Screenshots

### Dashboard
- Left: Recent notifications with acknowledge buttons
- Center: Live rates with clickable pairs for historical charts
- Right: Recent alerts with enable/disable/delete actions

### Alert Creation
- Currency pair dropdown
- Direction selector (above/below)
- Target rate input with validation
- Live preview of alert logic

### Historical Chart Modal
- Line chart showing 7-day price trend
- OHLC data table
- Current rate display

### All Alerts Views
- Table view with sortable columns
- Grid view with card-based layout
- Status indicators (Active, Triggered, Disabled)
- Distance-to-target percentage
