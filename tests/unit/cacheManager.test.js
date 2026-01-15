/**
 * Unit tests for cache manager
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CacheManager } from '../../src/services/cacheManager.js';

describe('CacheManager', () => {
  let cache;

  beforeEach(() => {
    localStorage.clear();
    cache = new CacheManager('test');
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      cache.set('key1', { data: 'value1' });
      const result = cache.get('key1');
      expect(result).toEqual({ data: 'value1' });
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for expired data', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('key1', { data: 'value1' });

      // Advance time by 1 hour + 1 second
      vi.setSystemTime(now + 3600000 + 1000);

      const result = cache.get('key1');
      expect(result).toBeNull();

      vi.useRealTimers();
    });

    it('should use custom TTL when provided', () => {
      cache.set('key1', { data: 'value1' }, 1000); // 1 second TTL
      const result = cache.get('key1');
      expect(result).toEqual({ data: 'value1' });
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired key', () => {
      cache.set('key1', { data: 'value1' });
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      cache.set('key1', { data: 'value1' });

      // Advance time by 1 hour + 1 second
      vi.setSystemTime(now + 3600000 + 1000);

      expect(cache.has('key1')).toBe(false);

      vi.useRealTimers();
    });
  });

  describe('remove', () => {
    it('should remove key from cache', () => {
      cache.set('key1', { data: 'value1' });
      cache.remove('key1');
      expect(cache.get('key1')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove all keys with prefix', () => {
      cache.set('key1', { data: 'value1' });
      cache.set('key2', { data: 'value2' });
      cache.clear();
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });
});
