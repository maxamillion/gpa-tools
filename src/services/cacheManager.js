/**
 * Cache Manager
 *
 * IndexedDB-based caching for API responses.
 * Reduces API calls and improves performance.
 */

import { openDB } from 'idb';

const DB_NAME = 'oss-health-analyzer';
const DB_VERSION = 1;
const STORE_NAME = 'analysis-cache';

export class CacheManager {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize the IndexedDB database
   */
  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp');
        }
      },
    });
  }

  /**
   * Get cached data by key
   * @param {string} key - Cache key (usually owner/repo)
   * @returns {Promise<Object|null>} Cached data or null
   */
  async get(key) {
    if (!this.db) {
      await this.init();
    }

    const record = await this.db.get(STORE_NAME, key);
    return record || null;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {Object} value - Data to cache
   */
  async set(key, value) {
    if (!this.db) {
      await this.init();
    }

    await this.db.put(STORE_NAME, {
      key,
      ...value,
    });
  }

  /**
   * Delete cached data by key
   * @param {string} key - Cache key
   */
  async delete(key) {
    if (!this.db) {
      await this.init();
    }

    await this.db.delete(STORE_NAME, key);
  }

  /**
   * Clear all cached data
   */
  async clear() {
    if (!this.db) {
      await this.init();
    }

    await this.db.clear(STORE_NAME);
  }

  /**
   * Clean up expired entries
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   */
  async cleanup(maxAge = 60 * 60 * 1000) {
    if (!this.db) {
      await this.init();
    }

    const cutoff = Date.now() - maxAge;
    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('timestamp');

    let cursor = await index.openCursor();
    while (cursor) {
      if (cursor.value.timestamp < cutoff) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }

    await tx.done;
  }

  /**
   * Get all cached keys
   * @returns {Promise<Array<string>>} List of cache keys
   */
  async keys() {
    if (!this.db) {
      await this.init();
    }

    return this.db.getAllKeys(STORE_NAME);
  }
}
