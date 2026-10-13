import { describe, expect, it } from 'vitest';
import {
  deviceAutoName,
  deviceColorIndex,
  deviceDetailsLine,
  deviceLabel,
  deviceShortId,
} from '../domain/label';

const PHONE = {
  name: 'Chrome on Android',
  model: 'SM-S918B',
  os: 'Android 14',
  browser: 'Chrome',
  screen: '412×915',
  customName: null,
};

describe('device label', () => {
  it('builds the name from model, system and browser', () => {
    expect(deviceAutoName(PHONE)).toBe('SM-S918B · Android 14 · Chrome');
  });

  it('skips the details the browser did not report', () => {
    expect(deviceAutoName({ ...PHONE, model: null })).toBe(
      'Android 14 · Chrome',
    );
  });

  it('falls back to the technical name without any detail', () => {
    expect(
      deviceAutoName({
        name: 'Chrome on Windows',
        model: null,
        os: null,
        browser: null,
      }),
    ).toBe('Chrome on Windows');
  });

  it('prefers the name the user gave', () => {
    expect(deviceLabel({ ...PHONE, customName: 'Telefon Ani' })).toBe(
      'Telefon Ani',
    );
  });

  it('keeps technical name and resolution as secondary text', () => {
    expect(deviceDetailsLine(PHONE)).toBe('Chrome on Android · 412×915');
  });

  it('shortens the id to its last four characters', () => {
    expect(deviceShortId('device-5f2e-a3f9')).toBe('#a3f9');
  });
});

describe('device color', () => {
  it('stays the same for one id', () => {
    expect(deviceColorIndex('device-abc')).toBe(deviceColorIndex('device-abc'));
  });

  it('stays inside the palette and uses most of it', () => {
    const used = new Set(
      Array.from({ length: 200 }, (_, i) => deviceColorIndex(`device-${i}`)),
    );

    expect([...used].every((i) => i >= 0 && i < 8)).toBe(true);
    expect(used.size).toBeGreaterThanOrEqual(7);
  });
});
