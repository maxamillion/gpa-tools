/**
 * Unit tests for GitHub API service
 * Following TDD: Write tests FIRST
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GitHubApiClient } from '../../src/services/githubApi.js';

describe('GitHubApiClient', () => {
  let client;

  beforeEach(() => {
    client = new GitHubApiClient();
  });

  describe('constructor', () => {
    it('should create client without token', () => {
      expect(client).toBeDefined();
    });

    it('should create client with token', () => {
      const authedClient = new GitHubApiClient('test-token');
      expect(authedClient).toBeDefined();
    });
  });

  describe('parseRepoUrl', () => {
    it('should parse valid GitHub URLs', () => {
      const result = client.parseRepoUrl('https://github.com/facebook/react');
      expect(result).toEqual({ owner: 'facebook', repo: 'react' });
    });

    it('should throw for invalid URLs', () => {
      expect(() => client.parseRepoUrl('invalid')).toThrow();
    });
  });

  describe('buildCacheKey', () => {
    it('should create consistent cache keys', () => {
      const key = client.buildCacheKey('facebook', 'react', 'info');
      expect(key).toBe('repo:facebook/react:info');
    });
  });
});
