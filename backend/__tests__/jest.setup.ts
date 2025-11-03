/**
 * Jest configuration for test support
 * This file is loaded before all tests run
 */

// Ensure TypeScript recognizes Jest globals
declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function afterAll(fn: () => void | Promise<void>): void;
  function expect(value: any): any;
  const jest: any;
}

export {};
