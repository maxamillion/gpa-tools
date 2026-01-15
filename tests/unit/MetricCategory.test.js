/**
 * Unit tests for MetricCategory enum/constants
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect } from 'vitest';
import { MetricCategory, METRIC_CATEGORIES } from '../../src/models/MetricCategory.js';

describe('MetricCategory', () => {
  it('should define all 5 categories', () => {
    expect(MetricCategory.ACTIVITY).toBe('activity');
    expect(MetricCategory.COMMUNITY).toBe('community');
    expect(MetricCategory.MAINTENANCE).toBe('maintenance');
    expect(MetricCategory.DOCUMENTATION).toBe('documentation');
    expect(MetricCategory.SECURITY).toBe('security');
  });

  it('should export METRIC_CATEGORIES array with metadata', () => {
    expect(METRIC_CATEGORIES).toHaveLength(5);

    METRIC_CATEGORIES.forEach((category) => {
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('description');
      expect(category).toHaveProperty('order');
      expect(typeof category.id).toBe('string');
      expect(typeof category.name).toBe('string');
      expect(typeof category.description).toBe('string');
      expect(typeof category.order).toBe('number');
    });
  });

  it('should have valid order values (1-5)', () => {
    METRIC_CATEGORIES.forEach((category) => {
      expect(category.order).toBeGreaterThanOrEqual(1);
      expect(category.order).toBeLessThanOrEqual(5);
    });
  });

  it('should have unique order values', () => {
    const orders = METRIC_CATEGORIES.map((c) => c.order);
    const uniqueOrders = new Set(orders);
    expect(uniqueOrders.size).toBe(orders.length);
  });

  it('should be sorted by order', () => {
    for (let i = 0; i < METRIC_CATEGORIES.length - 1; i++) {
      expect(METRIC_CATEGORIES[i].order).toBeLessThan(METRIC_CATEGORIES[i + 1].order);
    }
  });
});
