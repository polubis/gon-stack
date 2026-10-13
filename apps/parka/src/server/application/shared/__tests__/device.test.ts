import { describe, expect, it } from 'vitest';
import { toDevice } from '../device';

const ROW = {
  device_id: 'device-1',
  device_name: 'Safari on iOS',
  device_type: 'mobile',
};

describe('expense device', () => {
  it('carries the avatar chosen for its device', () => {
    expect(toDevice(ROW, new Map([['device-1', 'rocket']]))?.avatar).toBe(
      'rocket',
    );
  });

  it('has no avatar when none was chosen', () => {
    expect(toDevice(ROW)?.avatar).toBeNull();
  });

  it('ignores a stored avatar outside the catalog', () => {
    expect(
      toDevice(ROW, new Map([['device-1', 'unknown']]))?.avatar,
    ).toBeNull();
  });

  it('is absent for an expense made before devices were tracked', () => {
    expect(
      toDevice(
        { device_id: null, device_name: null, device_type: null },
        new Map([['device-1', 'cat']]),
      ),
    ).toBeNull();
  });
});
