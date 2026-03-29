import { describe, it, expect, vi, beforeEach } from 'vitest';
const HistoryService = require('../../../electron/historyService');
const fs = require('fs');
const path = require('path');

vi.mock('fs');
vi.mock('path');
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid-1234'
}));

describe('HistoryService', () => {
  const mockBasePath = '/data/history';
  let service;

  beforeEach(() => {
    vi.resetAllMocks();
    
    path.join = vi.fn((...args) => args.join('/'));
    fs.existsSync = vi.fn();
    fs.readFileSync = vi.fn();
    fs.writeFileSync = vi.fn();
    fs.mkdirSync = vi.fn();
    fs.renameSync = vi.fn();
    fs.unlinkSync = vi.fn();
    fs.readdirSync = vi.fn();

    service = new HistoryService(mockBasePath);
  });

  it('list() should return empty array if index does not exist', () => {
    fs.existsSync.mockReturnValue(false);
    expect(service.list()).toEqual([]);
  });

  it('list() should return parsed JSON if index exists', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('[{"id": "test-id"}]');
    expect(service.list()).toEqual([{ id: 'test-id' }]);
  });

  it('add() should write session and update index', () => {
    fs.existsSync.mockReturnValue(false); // dirs missing, file missing
    fs.readFileSync.mockReturnValue('[]'); // empty index initially

    const metadata = { title: 'Test Audit' };
    const session = { summary: { total: 0 } };

    const result = service.add(metadata, session);

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2); // session and index
    expect(fs.renameSync).toHaveBeenCalledTimes(2); // atomic renames
  });

  it('update() should update existing entry in index', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('[{"id": "test-id", "title": "Old"}]');

    const result = service.update('test-id', { title: 'New', note: 'Added note' });

    expect(result.success).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.json.tmp'),
      expect.stringContaining('"title": "New"'),
      'utf-8'
    );
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.json.tmp'),
      expect.stringContaining('"note": "Added note"'),
      'utf-8'
    );
  });

  it('prune() should delete oldest sessions if exceeding maxEntries', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('[{"id": "1"}, {"id": "2"}, {"id": "3"}]');

    const result = service.prune(2);

    expect(result.success).toBe(true);
    expect(result.pruned).toBe(1);
    expect(fs.unlinkSync).toHaveBeenCalledWith(expect.stringContaining('3.json'));
    // Ensure index was updated to keep only 2 items
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('index.json.tmp'),
      expect.not.stringContaining('"id": "3"'),
      'utf-8'
    );
  });
});
