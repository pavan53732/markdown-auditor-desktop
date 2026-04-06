import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveInitialCache } from '../detectorMetadata';
const CacheService = require('../../../electron/cacheService');
const fs = require('fs');
const path = require('path');

vi.mock('fs');
vi.mock('path');

describe('CacheService', () => {
  const mockCachePath = '/data/cache.json';
  let service;

  beforeEach(() => {
    vi.resetAllMocks();
    // Manually assign mock implementation if auto-mocking is failing to provide helper methods
    path.dirname = vi.fn().mockReturnValue('/data');
    fs.existsSync = vi.fn();
    fs.readFileSync = vi.fn();
    fs.writeFileSync = vi.fn();
    fs.mkdirSync = vi.fn();
    fs.renameSync = vi.fn();
    fs.unlinkSync = vi.fn();
    
    service = new CacheService(mockCachePath);
  });

  it('read() should return empty object if file does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(service.read()).toEqual({});
  });

  it('read() should return parsed JSON if file exists', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('{"a": 1}');
    expect(service.read()).toEqual({ a: 1 });
  });

  it('read() should return empty object and not crash on corrupt JSON', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('invalid-json');
    expect(service.read()).toEqual({});
  });

  it('write() should use atomic rename', () => {
    fs.existsSync.mockReturnValue(false); // dir doesn't exist
    const data = { test: true };
    service.write(data);

    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.tmp'),
      JSON.stringify(data),
      'utf-8'
    );
    expect(fs.renameSync).toHaveBeenCalled();
  });

  it('clear() should delete the file if it exists', () => {
    fs.existsSync.mockReturnValue(true);
    service.clear();
    expect(fs.unlinkSync).toHaveBeenCalledWith(mockCachePath);
  });

  it('getStats() should return correct metrics', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('{"key1": {}, "key2": {}}');
    
    const stats = service.getStats();
    expect(stats.exists).toBe(true);
    expect(stats.entryCount).toBe(2);
    expect(stats.path).toBe(mockCachePath);
  });
});

describe('resolveInitialCache Migration Logic', () => {
  it('should use file cache if non-empty and ignore legacy', () => {
    const fileCache = { 'hash1': { summary: {}, issues: [] } };
    const legacyString = JSON.stringify({ 'hash2': { summary: {}, issues: [] } });
    
    const { cache, shouldMigrate } = resolveInitialCache(fileCache, legacyString);
    
    expect(cache).toEqual(fileCache);
    expect(shouldMigrate).toBe(false);
  });

  it('should migrate from legacy if file cache is empty', () => {
    const fileCache = {};
    const legacyObj = { 'hash2': { summary: {}, issues: [] } };
    const legacyString = JSON.stringify(legacyObj);
    
    const { cache, shouldMigrate } = resolveInitialCache(fileCache, legacyString);
    
    expect(cache).toEqual(legacyObj);
    expect(shouldMigrate).toBe(true);
  });

  it('should handle malformed legacy data gracefully', () => {
    const fileCache = {};
    const legacyString = 'not-json';
    
    const { cache, shouldMigrate } = resolveInitialCache(fileCache, legacyString);
    
    expect(cache).toEqual({});
    expect(shouldMigrate).toBe(false);
  });

  it('should return empty if both are empty/missing', () => {
    const { cache, shouldMigrate } = resolveInitialCache(null, null);
    expect(cache).toEqual({});
    expect(shouldMigrate).toBe(false);
  });
});
