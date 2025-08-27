import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Store } from '../server/persistence.js';

describe('Store.save', () => {
  it('coalesces rapid save calls into a single write', async () => {
    vi.useFakeTimers();
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-'));
    const store = new Store({ dataDir: dir });

    const writeSpy = vi.fn().mockResolvedValue(undefined);
    // @ts-ignore allow test to override internal method
    store._writeToDisk = writeSpy;

    const p1 = store.save();
    const p2 = store.save();
    const p3 = store.save();

    expect(p1).toBe(p2);
    expect(p1).toBe(p3);

    vi.advanceTimersByTime(500);
    await p1;

    expect(writeSpy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
