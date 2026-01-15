/**
 * Unit tests for URL parameter utilities
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect } from 'vitest';
import { parseRepoFromUrl, encodeEvaluation, decodeEvaluation } from '../../src/utils/urlParams.js';

describe('URL Params Utilities', () => {
  describe('parseRepoFromUrl', () => {
    it('should parse owner and name from GitHub URL', () => {
      const result = parseRepoFromUrl('https://github.com/facebook/react');
      expect(result).toEqual({ owner: 'facebook', name: 'react' });
    });

    it('should parse URL with trailing slash', () => {
      const result = parseRepoFromUrl('https://github.com/vuejs/vue/');
      expect(result).toEqual({ owner: 'vuejs', name: 'vue' });
    });

    it('should parse URL with additional paths', () => {
      const result = parseRepoFromUrl('https://github.com/angular/angular/issues/123');
      expect(result).toEqual({ owner: 'angular', name: 'angular' });
    });

    it('should throw for invalid GitHub URL', () => {
      expect(() => parseRepoFromUrl('https://gitlab.com/owner/repo')).toThrow();
    });

    it('should throw for malformed URL', () => {
      expect(() => parseRepoFromUrl('not-a-url')).toThrow();
    });

    it('should throw for GitHub URL without owner/repo', () => {
      expect(() => parseRepoFromUrl('https://github.com')).toThrow();
    });
  });

  describe('encodeEvaluation', () => {
    it('should encode repository info to URL params', () => {
      const params = encodeEvaluation({ owner: 'facebook', name: 'react' });
      expect(params.get('repo')).toBe('facebook/react');
    });

    it('should return URLSearchParams', () => {
      const params = encodeEvaluation({ owner: 'facebook', name: 'react' });
      expect(params).toBeInstanceOf(URLSearchParams);
    });
  });

  describe('decodeEvaluation', () => {
    it('should decode repository from URL params', () => {
      const params = new URLSearchParams('repo=facebook/react');
      const result = decodeEvaluation(params);
      expect(result).toEqual({ owner: 'facebook', name: 'react' });
    });

    it('should return null for missing repo param', () => {
      const params = new URLSearchParams('');
      const result = decodeEvaluation(params);
      expect(result).toBeNull();
    });

    it('should return null for malformed repo param', () => {
      const params = new URLSearchParams('repo=invalid');
      const result = decodeEvaluation(params);
      expect(result).toBeNull();
    });
  });
});
