import { describe, expect, it } from 'vitest';
import { toDevice } from '../device';

const ROW = {
  device_id: 'device-1',
  device_name: 'Safari on iOS',
  device_type: 'mobile',
};

const profiles = (avatar: string | null, customName: string | null = null) =>
  new Map([['device-1', { avatar, customName }]]);

describe('expense device', () => {
  it('carries the avatar chosen for its device', () => {
    expect(toDevice(ROW, profiles('rocket'))?.avatar).toBe('rocket');
  });

  it('has no avatar when none was chosen', () => {
    expect(toDevice(ROW)?.avatar).toBeNull();
  });

  it('ignores a stored avatar outside the catalog', () => {
    expect(toDevice(ROW, profiles('unknown'))?.avatar).toBeNull();
  });

  it('carries the custom name given to its device', () => {
    expect(toDevice(ROW, profiles(null, 'Telefon Ani'))?.customName).toBe(
      'Telefon Ani',
    );
  });

  it('carries the details the browser reported', () => {
    expect(
      toDevice({
        ...ROW,
        device_model: 'SM-S918B',
        device_os: 'Android 14',
        device_browser: 'Chrome',
        device_screen: '412×915',
      }),
    ).toMatchObject({
      model: 'SM-S918B',
      os: 'Android 14',
      browser: 'Chrome',
      screen: '412×915',
    });
  });

  it('has no details for an expense made before they were collected', () => {
    expect(toDevice(ROW)).toMatchObject({
      model: null,
      os: null,
      browser: null,
      screen: null,
      customName: null,
    });
  });

  it('is absent for an expense made before devices were tracked', () => {
    expect(
      toDevice(
        { device_id: null, device_name: null, device_type: null },
        profiles('cat'),
      ),
    ).toBeNull();
  });
});
