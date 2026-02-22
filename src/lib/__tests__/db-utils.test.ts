import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { withRetry } from '@/lib/db-utils';

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns value on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and returns value on second attempt', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('transient')).mockResolvedValue('recovered');

    const promise = withRetry(fn);

    // First attempt fails, triggers setTimeout(200ms)
    await vi.advanceTimersByTimeAsync(200);
    const result = await promise;

    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('exhausts all retries and throws the last error', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('fail-1'))
      .mockRejectedValueOnce(new Error('fail-2'))
      .mockRejectedValueOnce(new Error('fail-3'));

    const promise = withRetry(fn).catch((e: Error) => e);

    // Advance through both retry delays: 200ms, 400ms
    await vi.advanceTimersByTimeAsync(200);
    await vi.advanceTimersByTimeAsync(400);

    const result = await promise;
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('fail-3');
    expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('throws immediately with retries=0', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('no retry'));

    await expect(withRetry(fn, { retries: 0 })).rejects.toThrow('no retry');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('uses exponential backoff delays', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error('e1'))
      .mockRejectedValueOnce(new Error('e2'))
      .mockResolvedValue('done');

    const promise = withRetry(fn, { retries: 2, baseDelay: 100 });

    // First retry delay: 100 * 2^0 = 100ms
    await vi.advanceTimersByTimeAsync(100);
    // Second retry delay: 100 * 2^1 = 200ms
    await vi.advanceTimersByTimeAsync(200);

    const result = await promise;
    expect(result).toBe('done');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('logs a warning on each retry', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('warn-me')).mockResolvedValue('ok');

    const promise = withRetry(fn);
    await vi.advanceTimersByTimeAsync(200);
    await promise;

    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('[db-retry]'),
      expect.stringContaining('warn-me'),
    );
  });
});
