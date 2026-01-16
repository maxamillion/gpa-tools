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

  /**
   * Save custom criteria to localStorage (no TTL - persists until cleared)
   * @param {Array} criteria - Array of custom criterion objects
   */
  saveCustomCriteria(criteria) {
    try {
      const key = this._getKey('custom-criteria');
      localStorage.setItem(key, JSON.stringify(criteria));
      return true;
    } catch (error) {
      console.error('Failed to save custom criteria:', error);
      return false;
    }
  }

  /**
   * Load custom criteria from localStorage
   * @returns {Array} Array of custom criterion objects
   */
  loadCustomCriteria() {
    try {
      const key = this._getKey('custom-criteria');
      const stored = localStorage.getItem(key);
      if (!stored) return [];

      return JSON.parse(stored);
    } catch (error) {
      console.error('Failed to load custom criteria:', error);
      return [];
    }
  }

  /**
   * Add a new custom criterion
   * @param {Object} criterion - Custom criterion object
   */
  addCustomCriterion(criterion) {
    const criteria = this.loadCustomCriteria();
    criteria.push(criterion);
    return this.saveCustomCriteria(criteria);
  }

  /**
   * Update an existing custom criterion
   * @param {string} criterionId - ID of criterion to update
   * @param {Object} updates - Updates to apply
   */
  updateCustomCriterion(criterionId, updates) {
    const criteria = this.loadCustomCriteria();
    const index = criteria.findIndex(c => c.id === criterionId);

    if (index === -1) {
      console.warn(`Criterion with ID ${criterionId} not found`);
      return false;
    }

    criteria[index] = { ...criteria[index], ...updates };
    return this.saveCustomCriteria(criteria);
  }

  /**
   * Delete a custom criterion
   * @param {string} criterionId - ID of criterion to delete
   */
  deleteCustomCriterion(criterionId) {
    const criteria = this.loadCustomCriteria();
    const filtered = criteria.filter(c => c.id !== criterionId);
    return this.saveCustomCriteria(filtered);
  }

  /**
   * Get a specific custom criterion by ID
   * @param {string} criterionId - ID of criterion
   * @returns {Object|null} Criterion object or null if not found
   */
  getCustomCriterion(criterionId) {
    const criteria = this.loadCustomCriteria();
    return criteria.find(c => c.id === criterionId) || null;
  }
}
