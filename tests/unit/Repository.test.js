/**
 * Unit tests for Repository model
 * Following TDD: Write tests FIRST, see them FAIL, then implement
 */

import { describe, it, expect } from 'vitest';
import { Repository } from '../../src/models/Repository.js';

describe('Repository Model', () => {
  describe('constructor', () => {
    it('should create a valid repository with all required fields', () => {
      const repo = new Repository({
        owner: 'facebook',
        name: 'react',
        url: 'https://github.com/facebook/react',
        description: 'A JavaScript library for building user interfaces',
        language: 'JavaScript',
        stars: 200000,
        forks: 42000,
        createdAt: '2013-05-24T16:15:54Z',
        updatedAt: '2026-01-15T10:30:00Z',
        license: 'MIT',
        isArchived: false,
        isPrivate: false,
      });

      expect(repo.owner).toBe('facebook');
      expect(repo.name).toBe('react');
      expect(repo.url).toBe('https://github.com/facebook/react');
      expect(repo.fullName).toBe('facebook/react');
      expect(repo.stars).toBe(200000);
      expect(repo.forks).toBe(42000);
      expect(repo.isArchived).toBe(false);
      expect(repo.isPrivate).toBe(false);
    });

    it('should throw error for invalid owner name', () => {
      expect(() => {
        new Repository({
          owner: 'invalid name!',
          name: 'repo',
          url: 'https://github.com/invalid name!/repo',
          stars: 0,
          forks: 0,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Invalid owner name');
    });

    it('should throw error for invalid repository name', () => {
      expect(() => {
        new Repository({
          owner: 'facebook',
          name: 'invalid repo!',
          url: 'https://github.com/facebook/invalid repo!',
          stars: 0,
          forks: 0,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Invalid repository name');
    });

    it('should throw error for non-GitHub URL', () => {
      expect(() => {
        new Repository({
          owner: 'facebook',
          name: 'react',
          url: 'https://gitlab.com/facebook/react',
          stars: 0,
          forks: 0,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Invalid GitHub URL');
    });

    it('should throw error for negative stars', () => {
      expect(() => {
        new Repository({
          owner: 'facebook',
          name: 'react',
          url: 'https://github.com/facebook/react',
          stars: -1,
          forks: 0,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Stars and forks must be non-negative');
    });

    it('should throw error for negative forks', () => {
      expect(() => {
        new Repository({
          owner: 'facebook',
          name: 'react',
          url: 'https://github.com/facebook/react',
          stars: 0,
          forks: -1,
          createdAt: '2020-01-01T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Stars and forks must be non-negative');
    });

    it('should throw error when createdAt is after updatedAt', () => {
      expect(() => {
        new Repository({
          owner: 'facebook',
          name: 'react',
          url: 'https://github.com/facebook/react',
          stars: 0,
          forks: 0,
          createdAt: '2026-01-15T00:00:00Z',
          updatedAt: '2020-01-01T00:00:00Z',
          isArchived: false,
          isPrivate: false,
        });
      }).toThrow('Created date must be before updated date');
    });
  });

  describe('fullName', () => {
    it('should compute fullName as owner/name', () => {
      const repo = new Repository({
        owner: 'vuejs',
        name: 'vue',
        url: 'https://github.com/vuejs/vue',
        stars: 0,
        forks: 0,
        createdAt: '2020-01-01T00:00:00Z',
        updatedAt: '2020-01-01T00:00:00Z',
        isArchived: false,
        isPrivate: false,
      });

      expect(repo.fullName).toBe('vuejs/vue');
    });
  });

  describe('age', () => {
    it('should calculate age in days since creation', () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const repo = new Repository({
        owner: 'test',
        name: 'repo',
        url: 'https://github.com/test/repo',
        stars: 0,
        forks: 0,
        createdAt: oneYearAgo.toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        isPrivate: false,
      });

      const age = repo.age;
      expect(age).toBeGreaterThan(360); // Approximately 365 days
      expect(age).toBeLessThan(370);
    });
  });
});
