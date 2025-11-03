# Smart Thermostat Scheduler

[![Tests](https://github.com/qu37zal/thermostat-scheduler/workflows/Tests/badge.svg)](https://github.com/qu37zal/thermostat-scheduler/actions/workflows/tests.yml)
[![Docker Build](https://github.com/qu37zal/thermostat-scheduler/workflows/Build%20and%20Push%20Docker%20Images/badge.svg)](https://github.com/qu37zal/thermostat-scheduler/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern web application for managing RTCOA WiFi-enabled smart thermostat schedules with advanced features including:

- **24-hour schedule editing** with AM/PM time format
- **Heat and cool schedules** managed separately or together
- **Edit Settings** to control mode, fan, hold, and temperature
- **Stir Fans** feature for hourly automatic fan circulation
- **Temperature history** tracking and visualization
- **Multi-thermostat support** with discovery and management

### Supported Thermostats

This application is compatible with **RTCOA (Radio Thermostat Company of America) WiFi-enabled thermostats**, including:
- **CT50** - Smart WiFi Thermostat
- **CT80** - Smart WiFi Thermostat
- And other RTCOA WiFi-compatible models

The application communicates with these thermostats via the RTCOA WiFi API (see documentation/RTCOAWiFIAPIV1_3.txt for API specifications).

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 16+ (for local development)
- npm 8+ (for local development)

### Run with Docker
```bash
docker-compose up -d --build
```

Access the application at `https://localhost:9004`

### Local Development
See the [Development](#development) section below.

## 📋 Project Structure

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
├── tst/                   # Tests
├── docker-compose.yml    # Service orchestration
└── README.md             # This file
```

## ✨ Features

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

## 🔌 API Endpoints

```
GET  /api/thermostats                    # List all thermostats
GET  /api/thermostats/:ip/data           # Get thermostat state
GET  /api/thermostats/:ip/program/:day   # Get schedule for day
POST /api/thermostats/:ip/program/:day   # Save schedule for day
POST /api/thermostats/:ip/settings       # Change mode/fan/hold/temp
GET  /api/thermostats/:ip/stir-fans      # Get stir fans setting
POST /api/thermostats/:ip/stir-fans      # Set stir fans enabled/disabled
```

## 📚 Documentation

Detailed documentation is available in the `documentation/` directory:
- `COMPONENT_ARCHITECTURE.md` - Component design and data flow
- `CHANGELOG.md` - Detailed version history
- `RTCOAWiFIAPIV1_3.txt` - Thermostat API specification
- `INDEX.md` - Documentation index

## 🛠️ Development

### Prerequisites
- Node.js 16 or higher
- npm 8 or higher

### Local Frontend Development
```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### Local Backend Development
```bash
cd backend
npm install
npm start
```

The backend API will run on `http://localhost:5001`

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Using Docker Compose for Development

```bash
docker-compose up
```

This will start:
- Backend API on port 5001
- Frontend on port 9004 (with SSL)
- Any other configured services

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for guidelines on:
- Setting up your development environment
- Making changes and creating pull requests
- Code style and testing requirements
- Commit message conventions

## 🔒 Security

For security issues, please see [SECURITY.md](SECURITY.md). **Do not** open a public issue for security vulnerabilities.

Key security considerations:
- This project is designed for trusted local networks
- Review [SECURITY.md](SECURITY.md) for deployment best practices
- Keep dependencies updated: `npm audit` and `npm audit fix`

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙋 Support

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general support
- **Documentation**: See the `documentation/` directory for detailed guides

## 📖 Changelog

See [CHANGELOG.md](documentation/CHANGELOG.md) for detailed version history and release notes.

## 🙏 Acknowledgments

This project communicates with RTCOA-compatible smart thermostats. Special thanks to the open source community for the amazing tools and libraries used in this project.

---

**Get started today:** Fork the repository, follow the [contributing guidelines](.github/CONTRIBUTING.md), and submit a pull request!


## Contributing

Contributions are welcome! Please ensure all changes are tested and documented.

## License

MIT
