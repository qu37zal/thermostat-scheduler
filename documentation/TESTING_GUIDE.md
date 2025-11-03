# Unit Test Coverage Guide

This document describes the comprehensive unit test coverage for the Smart Thermostat Scheduler project.

## Test Structure

### Backend Tests
Located in `/tst/unit/` directory:

- **temperature.test.ts** - Temperature conversion and validation utilities
- **database.test.ts** - Database service operations (thermostats, history)
- **helloController.test.ts** - Hello controller endpoint
- **stirFansScheduler.test.ts** - Stir fans (fan circulation) scheduler logic
- **thermostatDiscovery.test.ts** - Thermostat network discovery service
- **apiRoutes.test.ts** - REST API route endpoints and handlers

### Frontend Tests
Located in `/frontend/src/__tests__/` directory:

- **components/ThermostatStatus.test.tsx** - Thermostat status display component
- **components/ScheduleEditor.test.tsx** - 24-hour schedule editor component
- **utils/toast.test.ts** - Toast notification utility functions

## Running Tests

### Run All Tests
```bash
# From backend directory
cd backend
npm test

# From frontend directory
cd frontend
npm test
```

### Run Tests in Watch Mode
```bash
# Watch mode for backend
cd backend
npm run test:watch

# Watch mode for frontend (built-in to react-scripts)
cd frontend
npm test
```

### Generate Coverage Report
```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd frontend
npm test -- --coverage
```

## Test Coverage by Module

### Backend Services

#### Database Service (database.test.ts)
- Thermostat CRUD operations (Create, Read, Update, Delete)
- History data persistence and retrieval
- Database initialization and cleanup
- Error handling for unknown thermostats
- Timestamp inclusion in history records

**Test Count:** 12+ tests

#### Stir Fans Scheduler (stirFansScheduler.test.ts)
- Fan circulation scheduling logic
- Hourly execution intervals
- 10-minute fan runtime
- Fan state restoration
- Thermostat state management
- Error handling and logging

**Test Count:** 13+ tests

#### Thermostat Discovery (thermostatDiscovery.test.ts)
- Network device detection
- RTCOA model recognition (CT50, CT80, CT30, CT32, CT33, CT3949)
- IP address validation and extraction
- Local network scanning
- Network timeout handling
- Error recovery for unreachable devices
- Discovery persistence and caching

**Test Count:** 15+ tests

### Backend API

#### Routes (apiRoutes.test.ts)
- All thermostat endpoints (`GET /api/thermostats`, `POST /api/thermostats/:ip/settings`, etc.)
- Parameter validation (IP addresses, day numbers)
- Request/response handling
- HTTP status codes (200, 400, 404, 500)
- Error responses with messages
- CORS support
- Input sanitization

**Test Count:** 18+ tests

#### Hello Controller (helloController.test.ts)
- Hello endpoint response
- Response format validation
- Single call verification

**Test Count:** 2+ tests

### Utilities

#### Temperature Utilities (temperature.test.ts)
- Celsius to Fahrenheit conversion
- Fahrenheit to Celsius conversion
- Temperature range validation (50°F - 90°F)
- Boundary condition testing
- Custom min/max range validation

**Test Count:** 6+ tests

### Frontend Components

#### Thermostat Status Component (ThermostatStatus.test.tsx)
- Real-time temperature display
- Humidity level display
- HVAC mode display (Off, Heat, Cool, Auto)
- Fan status display
- Hold vs Schedule mode indication
- Runtime statistics display
- Offline thermostat handling
- Color-coded mode display (Blue for cool, Red for heat, Gray for offline)

**Test Count:** 14+ tests

#### Schedule Editor Component (ScheduleEditor.test.tsx)
- 24-hour schedule grid display
- AM/PM time format
- Separate heat/cool schedule support
- Temperature input with range validation (50-90°F)
- Single and multiple day save options
- Schedule mode switching (separate vs combined)
- Keyboard shortcuts (Escape, Ctrl+S, Arrow keys)
- Mobile responsive design
- Save/Cancel operations with confirmation

**Test Count:** 23+ tests

### Frontend Utilities

#### Toast Notifications (toast.test.ts)
- Toast types (Success, Error, Warning, Info)
- Custom timeout configuration
- Toast positioning (corners)
- Auto-dismiss functionality
- Manual dismiss capability
- Color schemes for each type
- Multiple toast stacking
- Queue management with max limit
- FIFO ordering
- HTML escaping for security
- Special character handling
- Performance optimization

**Test Count:** 25+ tests

## Test Execution Summary

**Total Test Files:** 9 files
**Total Tests:** 130+ assertions across all test suites

## Coverage Goals

### By Component Type
- **Services:** 100% coverage for critical business logic
- **Controllers:** 100% coverage for endpoint handlers
- **Utilities:** 100% coverage for helper functions
- **Components:** 80%+ coverage for rendering and interactions

### By Test Type
- **Unit Tests:** 100% of critical paths
- **Integration Tests:** Key service interactions (planned)
- **E2E Tests:** Main user workflows (planned)

## Test Practices

### Backend Testing
1. In-memory SQLite database for isolated testing
2. Mock HTTP clients for external API calls
3. Proper setup and teardown for database state
4. Async/await for database operations

### Frontend Testing
1. Component behavior without rendering
2. User interaction simulation
3. State validation after user actions
4. Accessibility considerations

## Continuous Integration

Tests are configured to run in GitHub Actions on:
- Push to main/develop branches
- Pull requests
- Multiple Node.js versions (16.x, 18.x, 20.x)

See `.github/workflows/tests.yml` for CI configuration.

## Adding New Tests

When adding new features:

1. Create test file in appropriate directory
2. Follow existing test patterns
3. Include describe/it blocks for organization
4. Aim for descriptive test names
5. Test both success and failure cases
6. Update this documentation

## Test Dependencies

### Backend
- **jest** - Test runner
- **ts-jest** - TypeScript support
- **@types/jest** - TypeScript type definitions

### Frontend
- **react-scripts** - Built-in test support (jest)
- **@testing-library/react** - Component testing (optional future addition)

## Troubleshooting

### Tests Not Running
```bash
# Ensure dependencies are installed
npm install

# Clear Jest cache
npx jest --clearCache

# Run with verbose output
npm test -- --verbose
```

### Database Test Issues
- Tests use in-memory SQLite (`:memory:` database)
- Each test suite gets its own database
- No cleanup of actual files required

### TypeScript Errors in Tests
- Ensure `@types/jest` is installed
- Check jest.setup.ts is loaded
- Verify tsconfig includes test files

## Future Enhancements

- Add React Testing Library for component rendering tests
- Add integration tests for API workflows
- Add E2E tests with Cypress or Playwright
- Increase coverage to 90%+ for all modules
- Add performance benchmarking tests
