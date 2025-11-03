# Test Directory Structure

This directory contains all tests for the Smart Thermostat Scheduler project, including 130+ unit tests covering backend services, controllers, utilities, and frontend components.

## Directory Layout

```
tst/
├── jest.setup.ts               Jest configuration and type globals
├── unit/                       Unit tests for individual functions/classes
│   ├── temperature.test.ts    Temperature conversion & validation (6 tests)
│   ├── database.test.ts       Database CRUD & history (12+ tests)
│   ├── helloController.test.ts Hello endpoint (2 tests)
│   ├── stirFansScheduler.test.ts Fan circulation logic (13+ tests)
│   ├── thermostatDiscovery.test.ts Network discovery (15+ tests)
│   └── apiRoutes.test.ts      REST API endpoints (18+ tests)
└── integ/                      Integration tests
    ├── test-discovery.js      Thermostat discovery integration test
    └── test-ip-scan.js        Network IP range scanning integration test

frontend/src/__tests__/         Frontend tests
├── components/
│   ├── ThermostatStatus.test.tsx  Status display (14+ tests)
│   └── ScheduleEditor.test.tsx    Schedule editing (23+ tests)
└── utils/
    └── toast.test.ts          Toast notifications (25+ tests)
```

## Unit Tests Overview

Located in `tst/unit/`, these test individual functions and components in isolation with 70+ tests.

### Backend Test Modules

**Temperature (6 tests)**
- Celsius ↔ Fahrenheit conversion
- Range validation (50-90°F)
- Custom min/max ranges

**Database (12+ tests)**
- Thermostat CRUD operations
- History data persistence
- Error handling

**Stir Fans Scheduler (13+ tests)**
- Fan circulation scheduling
- Hourly execution intervals
- State management

**Thermostat Discovery (15+ tests)**
- Network device detection
- RTCOA model recognition
- IP validation

**API Routes (18+ tests)**
- REST endpoint validation
- Parameter checking
- HTTP status codes

### Frontend Test Modules

**Thermostat Status Component (14+ tests)**
- Temperature and humidity display
- HVAC and fan mode display
- Color coding
- Offline handling

**Schedule Editor Component (23+ tests)**
- 24-hour schedule display
- Temperature input validation
- Save/cancel operations
- Keyboard shortcuts

**Toast Utilities (25+ tests)**
- 4 toast types
- Display positioning
- Queue management
- Security (HTML escaping)

## Running Tests

### All Tests
```bash
cd backend
npm test
```

### Specific Test File
```bash
npm test -- temperature.test.ts
npm test -- database.test.ts
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Example Unit Test Structure

```typescript
import { functionToTest } from '../src/path/to/module';

describe('Module Description', () => {
  describe('functionToTest', () => {
    it('should do something specific', () => {
      const result = functionToTest(input);
      expect(result).toBe(expectedValue);
    });
  });
});
```

## Integration Tests

Located in `tst/integ/`, these test interactions between systems (e.g., discovering thermostats on the network).

### Running Integration Tests

These are manual/exploratory tests that require network access to real thermostats.

```bash
# Discover thermostats on the network
node tst/integ/test-discovery.js

# Scan IP range for thermostats
node tst/integ/test-ip-scan.js
```

## Release Build Process

The `release` build target ensures all tests pass before building:

```bash
# Run all tests, then compile TypeScript
npm run release

# Equivalent to:
# npm test && npm run build
```

This ensures:
- ✅ All unit tests pass
- ✅ Code compiles without errors
- ✅ Build artifacts are generated in `dist/`

## Test Coverage

Run tests with coverage to see which code is tested:

```bash
npm run test:coverage
```

This generates a coverage report showing:
- Lines covered
- Branches covered
- Functions covered
- Statements covered

## Writing Tests

### Test File Naming
- Unit tests: `tst/unit/module-name.test.ts`
- Integration tests: `tst/integ/test-name.js`

### Test Organization
Use `describe` blocks to organize related tests:

```typescript
describe('Feature Name', () => {
  describe('Specific Function', () => {
    it('should handle case 1', () => { /* ... */ });
    it('should handle case 2', () => { /* ... */ });
  });
});
```

### Common Assertions

```typescript
expect(value).toBe(expected);           // Strict equality
expect(value).toEqual(expected);        // Deep equality
expect(value).toBeCloseTo(expected);    // Floating point
expect(array).toContain(item);          // Array contains
expect(fn).toThrow();                   // Function throws error
expect(promise).rejects.toThrow();      // Promise rejects
```

## Continuous Integration

The `release` build target should be run:
- Before committing code
- In CI/CD pipelines
- Before creating releases

```bash
npm run release
```

## Current Test Coverage

**Unit Tests:**
- `tst/unit/temperature.test.ts` - Temperature utility functions

**Integration Tests:**
- `tst/integ/test-discovery.js` - Thermostat network discovery
- `tst/integ/test-ip-scan.js` - IP range scanning

## Future Tests

Areas to add tests for:
- API endpoints (POST/GET)
- Database operations
- Schedule calculation logic
- Stir fans scheduler
- Thermostat state management
- UI component rendering

## See Also

- `../../backend/jest.config.js` - Jest configuration
- `../../backend/package.json` - npm scripts
