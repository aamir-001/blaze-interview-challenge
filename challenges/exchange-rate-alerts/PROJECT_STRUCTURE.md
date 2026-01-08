# Exchange Rate Alerts - Project Structure

## Monorepo Structure

```
exchange-rate-alerts/
├── backend/                    # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── database/
│   │   │   └── db.ts          # SQLite connection & initialization
│   │   ├── services/
│   │   │   ├── rateService.ts # Fetch rates from Blaze API
│   │   │   ├── alertService.ts # Alert CRUD operations
│   │   │   └── notificationService.ts # Notification operations
│   │   ├── workers/
│   │   │   └── rateChecker.ts # Background rate checker (30-60s interval)
│   │   ├── routes/
│   │   │   ├── rates.ts       # /api/rates endpoints
│   │   │   ├── alerts.ts      # /api/alerts endpoints
│   │   │   └── notifications.ts # /api/notifications endpoints
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript type definitions
│   │   └── server.ts          # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── RateDashboard.tsx # Current rates & charts
│   │   │   ├── AlertForm.tsx     # Create new alerts
│   │   │   ├── AlertList.tsx     # Manage alerts
│   │   │   └── NotificationList.tsx # Notification history
│   │   ├── hooks/
│   │   │   ├── useRates.ts       # Fetch & auto-refresh rates
│   │   │   ├── useAlerts.ts      # Alert management
│   │   │   └── useNotifications.ts # Notification fetching
│   │   ├── services/
│   │   │   └── api.ts            # API client for backend
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript type definitions
│   │   ├── App.tsx               # Main app component
│   │   ├── main.tsx              # React entry point
│   │   └── index.css             # Global styles with Tailwind
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts            # Vite config with proxy to backend
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── mock-rates.json             # Mock historical data
├── package.json                # Root package.json with dev scripts
└── README.md

## Installed Dependencies

### Backend
- express: Web framework
- cors: CORS support
- better-sqlite3: SQLite database
- node-cron: Scheduling rate checks
- typescript, tsx: TypeScript support
- @types/*: Type definitions

### Frontend
- react, react-dom: UI framework
- recharts: Charting library
- tailwindcss: CSS framework
- vite: Build tool & dev server
- typescript: TypeScript support
- @types/*: Type definitions

### Root
- concurrently: Run frontend + backend together

## Development Scripts

From root directory:
- `npm run dev` - Run both frontend and backend
- `npm run dev:backend` - Run backend only (port 5000)
- `npm run dev:frontend` - Run frontend only (port 3000)
- `npm run build` - Build both projects

## Backend Port
- Express server: http://localhost:5000

## Frontend Port
- Vite dev server: http://localhost:3000
- Proxies /api requests to backend (configured in vite.config.ts)

## Notes
- All placeholder files created with comments
- No implementation yet - structure only
- TypeScript configured for both projects
- Tailwind CSS ready to use
- SQLite database will be created on first run
