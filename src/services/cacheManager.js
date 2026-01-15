/**
 * Cache Manager Service
 * localStorage-based caching with TTL support
 */

const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

export class CacheManager {
  constructor(prefix = 'gpa') {
    this.prefix = prefix;
  }

  _getKey(key) {
    return `${this.prefix}:${key}`;
  }

  set(key, data, ttl = DEFAULT_TTL) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    try {
      localStorage.setItem(this._getKey(key), JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Failed to write to cache:', error);
    }
  }

  get(key) {
    try {
      const cached = localStorage.getItem(this._getKey(key));
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > ttl;

      if (isExpired) {
        this.remove(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null;
    }
  }

  has(key) {
    return this.get(key) !== null;
  }

  remove(key) {
    try {
      localStorage.removeItem(this._getKey(key));
    } catch (error) {
      console.error('Failed to remove from cache:', error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(`${this.prefix}:`)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
