/**
 * Unit tests for data formatters
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect } from 'vitest';
import {
  formatNumber,
  formatDate,
  formatDuration,
  formatPercentage,
} from '../../src/utils/formatters.js';

describe('Formatters', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(42)).toBe('42');
    });

    it('should handle decimals', () => {
      expect(formatNumber(15.3)).toBe('15.3');
      expect(formatNumber(15.345, 2)).toBe('15.35');
    });
  });

  describe('formatDate', () => {
    it('should format ISO date strings', () => {
      const date = '2026-01-15T10:30:00Z';
      const formatted = formatDate(date);
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Jan');
    });

    it('should handle Date objects', () => {
      const date = new Date('2026-01-15T10:30:00Z');
      const formatted = formatDate(date);
      expect(formatted).toContain('2026');
    });
  });

  describe('formatDuration', () => {
    it('should format days', () => {
      expect(formatDuration(5)).toBe('5 days');
      expect(formatDuration(1)).toBe('1 day');
    });

    it('should format hours for < 1 day', () => {
      expect(formatDuration(0.5)).toBe('12 hours');
      expect(formatDuration(0.04)).toBe('1 hour');
    });

    it('should format weeks for > 14 days', () => {
      expect(formatDuration(30)).toBe('4 weeks');
      expect(formatDuration(90)).toBe('13 weeks');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(85.5)).toBe('85.5%');
      expect(formatPercentage(100)).toBe('100%');
      expect(formatPercentage(0)).toBe('0%');
    });

    it('should handle decimals', () => {
      expect(formatPercentage(85.567, 1)).toBe('85.6%');
      expect(formatPercentage(85.567, 0)).toBe('86%');
    });
  });
});
