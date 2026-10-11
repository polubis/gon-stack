import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  dayAtCurrentTime,
  dayStart,
  fromDateTimeInput,
  isTimeZone,
  localDay,
  localMonth,
  nowDateTimeInput,
  toDateTimeInput,
  today,
} from '../date';

const WARSAW = 'Europe/Warsaw';
const LOS_ANGELES = 'America/Los_Angeles';
const AUCKLAND = 'Pacific/Auckland';

describe('day of an instant', () => {
  it('moves to the next day when the zone is ahead of UTC at night', () => {
    // 23:30 UTC on 30 Sep is 01:30 on 1 Oct in Warsaw (UTC+2).
    expect(localDay('2026-09-30T23:30:00.000Z', WARSAW)).toBe('2026-10-01');
    expect(localMonth('2026-09-30T23:30:00.000Z', WARSAW)).toBe('2026-10');
  });

  it('stays on the previous day when the zone is behind UTC in the morning', () => {
    // 02:00 UTC on 1 Oct is still 30 Sep evening in Los Angeles (UTC-7).
    expect(localDay('2026-10-01T02:00:00.000Z', LOS_ANGELES)).toBe(
      '2026-09-30',
    );
    expect(localMonth('2026-10-01T02:00:00.000Z', LOS_ANGELES)).toBe('2026-09');
  });

  it('reads UTC midnight as the same evening before it in a western zone', () => {
    expect(localDay('2026-01-01T00:00:00.000Z', LOS_ANGELES)).toBe(
      '2025-12-31',
    );
  });

  it('crosses the year edge in a far eastern zone', () => {
    expect(localDay('2025-12-31T12:00:00.000Z', AUCKLAND)).toBe('2026-01-01');
  });

  it('follows daylight saving time changes', () => {
    expect(localDay('2026-03-28T23:30:00.000Z', WARSAW)).toBe('2026-03-29');
    expect(localDay('2026-03-29T22:30:00.000Z', WARSAW)).toBe('2026-03-30');
  });

  it('leaves a plain day untouched in every zone', () => {
    expect(localDay('2026-10-01', LOS_ANGELES)).toBe('2026-10-01');
    expect(localDay('2026-10-01', AUCKLAND)).toBe('2026-10-01');
  });

  it('gives today in the asked zone', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-30T23:30:00.000Z'));
    expect(today(WARSAW)).toBe('2026-10-01');
    expect(today(LOS_ANGELES)).toBe('2026-09-30');
    vi.useRealTimers();
  });
});

describe('time zone check', () => {
  it('accepts IANA names and rejects anything else', () => {
    expect(isTimeZone(WARSAW)).toBe(true);
    expect(isTimeZone('UTC')).toBe(true);
    expect(isTimeZone('Mars/Olympus')).toBe(false);
    expect(isTimeZone('')).toBe(false);
  });
});

describe('local date and time input', () => {
  beforeAll(() => {
    vi.stubEnv('TZ', WARSAW);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('shows a stored instant in local time', () => {
    expect(toDateTimeInput('2026-07-15T10:30:00.000Z')).toBe(
      '2026-07-15T12:30',
    );
    expect(toDateTimeInput('2026-01-15T10:30:00.000Z')).toBe(
      '2026-01-15T11:30',
    );
  });

  it('shows UTC midnight as the local early morning, not midnight', () => {
    expect(toDateTimeInput('2026-07-15T00:00:00.000Z')).toBe(
      '2026-07-15T02:00',
    );
  });

  it('stores a local value as a UTC instant', () => {
    expect(fromDateTimeInput('2026-07-15T12:30')).toBe(
      '2026-07-15T10:30:00.000Z',
    );
    expect(fromDateTimeInput('2026-01-15T00:15')).toBe(
      '2026-01-14T23:15:00.000Z',
    );
  });

  it('round-trips a value around local midnight', () => {
    for (const value of ['2026-07-15T00:00', '2026-07-15T23:59']) {
      expect(toDateTimeInput(fromDateTimeInput(value)!)).toBe(value);
    }
  });

  it('rejects an empty or malformed value', () => {
    expect(fromDateTimeInput('')).toBeNull();
    expect(fromDateTimeInput('2026-07-15')).toBeNull();
    expect(fromDateTimeInput('2026-13-45T99:99')).toBeNull();
  });

  it('prefills with the current moment', () => {
    expect(nowDateTimeInput(new Date('2026-07-15T10:30:45.000Z'))).toBe(
      '2026-07-15T12:30',
    );
  });

  it('puts a plain day at the current local time of day', () => {
    const now = new Date('2026-07-15T21:10:00.000Z');
    const iso = dayAtCurrentTime('2026-03-01', now);

    expect(toDateTimeInput(iso)).toBe('2026-03-01T23:10');
    expect(iso).not.toMatch(/T00:00:00.000Z$/);
  });

  it('keeps a full instant as is', () => {
    expect(dayAtCurrentTime('2026-03-01T08:00:00.000Z')).toBe(
      '2026-03-01T08:00:00.000Z',
    );
  });

  it('starts a plain day at local midnight', () => {
    expect(dayStart('2026-07-15')).toBe('2026-07-14T22:00:00.000Z');
    expect(localDay(dayStart('2026-07-15'))).toBe('2026-07-15');
  });
});
