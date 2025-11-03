# Test Directory Structure

This directory contains all tests for the Smart Thermostat Scheduler project.

## Directory Layout

```
tst/
├── unit/                   Unit tests for individual functions/classes
│   └── *.test.ts          Test files (Jest format)
└── integ/                 Integration tests
    ├── test-discovery.js  Thermostat discovery integration test
    └── test-ip-scan.js    Network IP range scanning integration test
```

## Unit Tests

Located in `tst/unit/`, these test individual functions and components in isolation.

### Running Unit Tests

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
