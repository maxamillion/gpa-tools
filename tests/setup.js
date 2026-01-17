/**
 * Vitest setup file
 * Runs before all tests to configure the test environment
 */

import { vi } from 'vitest';

// Mock idb globally because happy-dom doesn't support IndexedDB
vi.mock('idb', () => {
  return {
    openDB: vi.fn().mockImplementation(() => {
      return Promise.resolve({
        put: vi.fn(),
        get: vi.fn(),
        delete: vi.fn(),
        getAllKeys: vi.fn(),
        close: vi.fn(),
        transaction: vi.fn().mockReturnValue({
          store: { delete: vi.fn() },
          done: Promise.resolve(),
        }),
        objectStoreNames: { contains: vi.fn().mockReturnValue(false) },
        createObjectStore: vi.fn(),
      });
    }),
  };
});

// Suppress console output in tests (optional)
// global.console = {
//   ...console,
//   log: vi.fn(),
//   debug: vi.fn(),
//   info: vi.fn(),
//   warn: vi.fn(),
//   error: vi.fn(),
// };