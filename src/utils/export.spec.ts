import { describe, it, expect, vi } from 'vitest';
import { exportICS } from './export';
import type { BNPLPlan, Obligation } from '../types';

describe('exportICS', () => {
  it('creates an ICS file with events and CRLF line endings', async () => {
    const bnpl: BNPLPlan[] = [
      {
        id: 'p1',
        provider: 'Affirm',
        description: 'Laptop',
        total: 1000,
        remaining: 0,
        dueDates: ['2024-08-01T00:00:00Z'],
      },
    ];
    const obligations: Obligation[] = [
      {
        id: 'o1',
        name: 'Gym',
        amount: 50,
        cadence: 'monthly',
        dueDate: '2024-08-05T00:00:00Z',
      },
    ];

    let text = '';
    const mock = vi.fn((_: string, blob: Blob) => blob.text().then((t) => { text = t; }));

    exportICS('test.ics', bnpl, obligations, mock);
    await mock.mock.results[0].value;

    expect(text).toContain('BEGIN:VCALENDAR');
    expect(text).toMatch(/BEGIN:VEVENT/);
    expect(text).toMatch(/DTSTAMP:\d{8}T\d{6}Z/);
    expect(text).toMatch(/RRULE:FREQ=MONTHLY/);
    expect(text).toMatch(/\r\n/);
    expect(text).not.toMatch(/(?<!\r)\n/);
  });
});
