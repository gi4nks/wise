import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TTLCache } from './cache';

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>();
  });

  it('should store and retrieve data', () => {
    cache.set('key', 'value', 1000);
    expect(cache.get('key')).toBe('value');
  });

  it('should return null if key does not exist', () => {
    expect(cache.get('non-existent')).toBeNull();
  });

  it('should return null if data has expired', () => {
    vi.useFakeTimers();
    cache.set('key', 'value', 100);
    
    vi.advanceTimersByTime(150);
    expect(cache.get('key')).toBeNull();
    
    vi.useRealTimers();
  });

  it('should invalidate specific key', () => {
    cache.set('key', 'value', 1000);
    cache.invalidate('key');
    expect(cache.get('key')).toBeNull();
  });

  it('should invalidate all keys', () => {
    cache.set('k1', 'v1', 1000);
    cache.set('k2', 'v2', 1000);
    cache.invalidateAll();
    expect(cache.get('k1')).toBeNull();
    expect(cache.get('k2')).toBeNull();
  });
});
