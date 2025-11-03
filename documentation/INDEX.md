# Documentation Index

This directory contains all development documentation, API specifications, and progress tracking for the Smart Thermostat Scheduler project.

## Quick Reference

- **Supported Hardware**: `SUPPORTED_HARDWARE.md` - Thermostat models and hardware requirements
- **API Specification**: `RTCOAWiFIAPIV1_3.txt` - Official thermostat API documentation
- **Architecture**: `COMPONENT_ARCHITECTURE.md` - Component design and data flow
- **Schedule Editing**: `SCHEDULE_EDITOR_GUIDE.md` - How-to guide for schedule features
- **Recent Updates**: `SESSION_3_SUMMARY.md` - Latest development session summary

## Documentation Files

### Project Overview
- **SUPPORTED_HARDWARE.md** - Compatible thermostat models (CT50, CT80, etc.) and hardware requirements
- **COMPONENT_ARCHITECTURE.md** - System design, component relationships, data flow, and API integration

### Features & Implementation
- **SCHEDULE_EDITOR_GUIDE.md** - Advanced schedule editor features (24-hour, AM/PM, heat/cool)
- **TOAST_IMPLEMENTATION.md** - Toast notification system implementation details
- **SETTINGS_FIX_COMPLETE.md** - Edit Settings feature and thermostat control persistence
- **README_TOASTS.md** - Toast notification styling and behavior

### Development Progress
- **SESSION_3_SUMMARY.md** - Latest session summary with completed tasks
- **IMPLEMENTATION_SUMMARY.md** - Overall implementation status
- **REFACTORING_SUMMARY.md** - Code refactoring notes
- **CHANGELOG.md** - Version history and changes
- **ITERATION_COMPLETE.md** - Iteration completion notes
- **COMPLETION_CHECKLIST.md** - Feature completion tracking

### Toast Notifications (Detailed)
- **TOAST_VISUAL_GUIDE.md** - Visual guide to toast notifications
- **TOAST_NOTIFICATIONS_COMPLETE.md** - Toast completion notes
- **TOAST_NOTIFICATIONS_FINAL.md** - Final toast implementation details
- **TOAST_QUICK_REFERENCE.md** - Quick reference for toast usage

### API Reference
- **RTCOAWiFIAPIV1_3.txt** - Official RTCOA WiFi Thermostat API documentation (v1.3)
- **RTCOAWiFIAPIV1_3.pdf** - PDF version of API specification

## Key Features

### Schedule Management
- 24-hour scheduling with any time selection
- Separate heat and cool schedules
- AM/PM time format
- Single day or all 7 days save options

### Thermostat Control
- Mode management (Off/Heat/Cool/Auto)
- Fan mode control (Auto/Auto-Circulate/On)
- Hold mode (Schedule/Hold)
- Target temperature control (50-90°F)

### Stir Fans
- Automatic hourly fan circulation
- Per-thermostat enable/disable

### User Interface
- Tab-based navigation (Status/Schedule/History)
- Toast notifications for all operations
- Real-time temperature history
- Temperature trend visualization

## Architecture Highlights

### Frontend (React + TypeScript)
- `ThermostatStatus.tsx` - Main thermostat control interface
- `ScheduleEditorAdvanced.tsx` - 24-hour schedule editor
- `ScheduleDisplayCombined.tsx` - Schedule visualization
- `HistoryVisualization.tsx` - Temperature history charts
- `ToastContainer.tsx` - Toast notification system

### Backend (Node.js + Express)
- `thermostatProxyController.ts` - Thermostat API proxy
- `stirFansScheduler.ts` - Hourly fan circulation automation
- `thermostatDiscovery.ts` - Network thermostat discovery
- `database.ts` - SQLite data persistence

### Database (SQLite)
- `known_thermostats` - Thermostat registry
- `thermostat_history` - Temperature history tracking
- `stir_fans_settings` - Stir fans configuration

## Running the Project

```bash
# Docker
docker-compose up -d --build

# Access UI
https://localhost:9004

# Backend API
http://localhost:5555
```

## API Endpoints

```
GET    /api/thermostats                    List all thermostats
GET    /api/thermostats/:ip/data           Get thermostat state
GET    /api/thermostats/:ip/program/:day   Get schedule for day
POST   /api/thermostats/:ip/program/:day   Save schedule for day
POST   /api/thermostats/:ip/settings       Change thermostat settings
GET    /api/thermostats/:ip/stir-fans      Get stir fans setting
POST   /api/thermostats/:ip/stir-fans      Set stir fans enabled/disabled
```

## Development Notes

### Recent Changes
- Implemented toast notifications throughout the application
- Created advanced schedule editor with full 24-hour support
- Added Edit Settings form with mode, fan, hold, and temperature controls
- Implemented Stir Fans feature with automatic scheduling
- Fixed all data persistence issues

### Known Good Patterns
- Toast for success: `success('Message')`
- Toast for error: `error('Message')`
- Schedule saving: Individual day or all 7 days
- Settings persistence: Immediate API call to thermostat

### Testing Checklist
- [ ] Schedule changes persist to thermostat
- [ ] Edit Settings changes persist
- [ ] Stir Fans toggle works correctly
- [ ] Toast notifications display properly
- [ ] Temperature history updates in real-time
- [ ] Multiple thermostats work independently

## File Organization

```
documentation/
├── API Specifications/
│   ├── RTCOAWiFIAPIV1_3.txt
│   └── RTCOAWiFIAPIV1_3.pdf
├── Feature Guides/
│   ├── SCHEDULE_EDITOR_GUIDE.md
│   ├── SETTINGS_FIX_COMPLETE.md
│   └── TOAST_IMPLEMENTATION.md
├── Architecture/
│   └── COMPONENT_ARCHITECTURE.md
└── Progress Tracking/
    ├── SESSION_3_SUMMARY.md
    ├── IMPLEMENTATION_SUMMARY.md
    └── [Other summaries...]
```

## Need Help?

- For UI features: See `COMPONENT_ARCHITECTURE.md`
- For API: See `RTCOAWiFIAPIV1_3.txt`
- For schedule editing: See `SCHEDULE_EDITOR_GUIDE.md`
- For recent progress: See `SESSION_3_SUMMARY.md`
