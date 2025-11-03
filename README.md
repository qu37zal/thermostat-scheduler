# Smart Thermostat Scheduler

A web application for managing smart thermostat schedules with advanced features including:
- **24-hour schedule editing** with AM/PM time format
- **Heat and cool schedules** managed separately or together
- **Edit Settings** to control mode, fan, hold, and temperature
- **Stir Fans** feature for hourly automatic fan circulation
- **Temperature history** tracking and visualization
- **Multi-thermostat support** with discovery and management

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Run with Docker
```bash
docker-compose up -d --build
```

Access the application at `https://localhost:9004`

## Project Structure

```
smart-thermostat-scheduler/
├── frontend/              # React TypeScript UI
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── utils/        # Utilities (toast, etc)
│   │   └── index.tsx     # Entry point
│   └── package.json
├── backend/               # Node.js Express API
│   ├── src/
│   │   ├── controllers/  # API controllers
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── app.ts        # Express app
│   └── package.json
├── documentation/         # Development docs & API specs
├── docker-compose.yml    # Service orchestration
└── README.md             # This file
```

## Features

### Schedule Management
- Edit 24-hour schedules for any day
- Set different schedules for heat and cool modes
- Save individual day or all 7 days at once
- Intuitive AM/PM time format

### Thermostat Control
- Change mode (Off/Heat/Cool/Auto)
- Adjust fan mode (Auto/Auto-Circulate/On)
- Set hold mode (Schedule/Hold)
- Control target temperature (50-90°F)

### Stir Fans
- Automatic hourly fan circulation (configurable)
- Turns fan on for 10 minutes, then restores original state
- Per-thermostat enable/disable toggle

### History & Monitoring
- Real-time temperature history
- Runtime histogram visualization
- Temperature trend charts
- 60-second polling for live updates

## API Endpoints

```
GET  /api/thermostats                    # List all thermostats
GET  /api/thermostats/:ip/data           # Get thermostat state
GET  /api/thermostats/:ip/program/:day   # Get schedule for day
POST /api/thermostats/:ip/program/:day   # Save schedule for day
POST /api/thermostats/:ip/settings       # Change mode/fan/hold/temp
GET  /api/thermostats/:ip/stir-fans      # Get stir fans setting
POST /api/thermostats/:ip/stir-fans      # Set stir fans enabled/disabled
```

## Documentation

See the `documentation/` directory for detailed guides:
- `COMPONENT_ARCHITECTURE.md` - Component design and data flow
- `SCHEDULE_EDITOR_GUIDE.md` - Schedule editing details
- `SESSION_3_SUMMARY.md` - Development progress
- `RTCOAWiFIAPIV1_3.txt` - Thermostat API specification

## Development

### Local Frontend
```bash
cd frontend
npm install
npm start
```

### Local Backend
```bash
cd backend
npm install
npm start
```

## Contributing

Contributions are welcome! Please ensure all changes are tested and documented.

## License

MIT
