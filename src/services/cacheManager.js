/**
 * Cache Manager Service
 * IndexedDB-based caching with TTL support using 'idb'
 */

import { openDB } from 'idb';

const DB_NAME = 'gpa-tools-db';
const STORE_NAME = 'cache';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export class CacheManager {
  constructor(prefix = 'gpa') {
    this.prefix = prefix;
    this.dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }

  _getKey(key) {
    return `${this.prefix}:${key}`;
  }

  async set(key, data, ttl = DEFAULT_TTL) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      const db = await this.dbPromise;
      await db.put(STORE_NAME, cacheEntry, this._getKey(key));
    } catch (error) {
      console.error('Failed to write to cache:', error);
    }
  }

  async get(key) {
    try {
      const db = await this.dbPromise;
      const cached = await db.get(STORE_NAME, this._getKey(key));

      if (!cached) return null;

      const { data, timestamp, ttl } = cached;
      const isExpired = Date.now() - timestamp > ttl;

      if (isExpired) {
        await this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null;
    }
  }

  async has(key) {
    return (await this.get(key)) !== null;
  }

  async remove(key) {
    try {
      const db = await this.dbPromise;
      await db.delete(STORE_NAME, this._getKey(key));
    } catch (error) {
      console.error('Failed to remove from cache:', error);
    }
  }

  async clear() {
    try {
      const db = await this.dbPromise;
      const keys = await db.getAllKeys(STORE_NAME);
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const promises = [];
      
      for (const key of keys) {
        if (key.startsWith(`${this.prefix}:`)) {
          promises.push(tx.store.delete(key));
        }
      }
      
      await Promise.all(promises);
      await tx.done;
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async close() {
    try {
      const db = await this.dbPromise;
      db.close();
    } catch (error) {
      console.error('Failed to close cache:', error);
    }
  }
}