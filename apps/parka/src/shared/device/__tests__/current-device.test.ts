import { beforeEach, describe, expect, it } from 'vitest';
import { currentDevice } from '../integration/current-device';

describe('current device', () => {
  beforeEach(() => window.localStorage.clear());

  it('keeps the same id across calls in one browser', () => {
    expect(currentDevice().id).toBe(currentDevice().id);
  });

  it('keeps the id after a reload', () => {
    const first = currentDevice().id;

    expect(window.localStorage.getItem('parka:device-id')).toBe(first);
    expect(currentDevice().id).toBe(first);
  });

  it('gets a different id in a browser with fresh storage', () => {
    const first = currentDevice().id;
    window.localStorage.clear();

    expect(currentDevice().id).not.toBe(first);
  });

  it('describes the browser it runs in', () => {
    const device = currentDevice();

    expect(device.name.length).toBeGreaterThan(0);
    expect(['mobile', 'desktop', 'tablet']).toContain(device.type);
  });
});
