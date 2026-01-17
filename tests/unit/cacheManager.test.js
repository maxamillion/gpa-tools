/**
 * Unit tests for cache manager
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../../src/services/cacheManager.js';

describe('CacheManager', () => {
  let cache;
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();
    cache = new CacheManager('test');
    mockDb = await cache.dbPromise;
  });

  describe('set and get', () => {
    it('should store data', async () => {
      await cache.set('key1', { data: 'value1' });
      expect(mockDb.put).toHaveBeenCalledWith(
        'cache',
        expect.objectContaining({
          data: { data: 'value1' },
          ttl: 3600000,
        }),
        'test:key1'
      );
    });

    it('should retrieve data', async () => {
      mockDb.get.mockResolvedValue({
        data: { data: 'value1' },
        timestamp: Date.now(),
        ttl: 3600000,
      });

      const result = await cache.get('key1');
      expect(result).toEqual({ data: 'value1' });
      expect(mockDb.get).toHaveBeenCalledWith('cache', 'test:key1');
    });

    it('should return null for non-existent key', async () => {
      mockDb.get.mockResolvedValue(undefined);
      const result = await cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for expired data', async () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      // Data from 1 hour + 1 second ago
      mockDb.get.mockResolvedValue({
        data: { data: 'value1' },
        timestamp: now - 3600000 - 1000,
        ttl: 3600000,
      });

      const result = await cache.get('key1');
      expect(result).toBeNull();
      // Should delete expired item
      expect(mockDb.delete).toHaveBeenCalledWith('cache', 'test:key1');

      vi.useRealTimers();
    });

    it('should use custom TTL when provided', async () => {
      await cache.set('key1', { data: 'value1' }, 1000); // 1 second TTL
      expect(mockDb.put).toHaveBeenCalledWith(
        'cache',
        expect.objectContaining({ ttl: 1000 }),
        'test:key1'
      );
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired key', async () => {
      mockDb.get.mockResolvedValue({
        data: { data: 'value1' },
        timestamp: Date.now(),
        ttl: 3600000,
      });
      expect(await cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', async () => {
      mockDb.get.mockResolvedValue(undefined);
      expect(await cache.has('nonexistent')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove key from cache', async () => {
      await cache.remove('key1');
      expect(mockDb.delete).toHaveBeenCalledWith('cache', 'test:key1');
    });
  });

  describe('clear', () => {
    it('should remove all keys with prefix', async () => {
      mockDb.getAllKeys.mockResolvedValue(['test:key1', 'test:key2', 'other:key3']);
      const mockDelete = vi.fn();
      mockDb.transaction.mockReturnValue({
        store: { delete: mockDelete },
        done: Promise.resolve(),
      });

      await cache.clear();

      expect(mockDb.getAllKeys).toHaveBeenCalledWith('cache');
      expect(mockDelete).toHaveBeenCalledWith('test:key1');
      expect(mockDelete).toHaveBeenCalledWith('test:key2');
      expect(mockDelete).not.toHaveBeenCalledWith('other:key3');
    });
  });
});
