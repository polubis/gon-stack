import { describe, expect, it } from 'vitest';
import { detectDeviceDetails } from '../domain/detect';

const CHROME_ANDROID =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const FIREFOX_LINUX =
  'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0';

describe('device details', () => {
  it('gives the raw model and system version on Android Chromium', () => {
    const details = detectDeviceDetails(
      { userAgent: CHROME_ANDROID },
      { model: 'SM-S918B', platformVersion: '14.0.0' },
      { width: 412, height: 915 },
    );

    expect(details).toEqual({
      model: 'SM-S918B',
      os: 'Android 14',
      browser: 'Chrome',
      screen: '412×915',
    });
  });

  it('has no model when the browser does not expose it', () => {
    const details = detectDeviceDetails({ userAgent: SAFARI_IPHONE });

    expect(details).toEqual({
      model: null,
      os: 'iOS 17',
      browser: 'Safari',
      screen: null,
    });
  });

  it('tells Windows 11 from Windows 10 by the platform version', () => {
    const win = (platformVersion: string) =>
      detectDeviceDetails({ userAgent: CHROME_WINDOWS }, { platformVersion })
        .os;

    expect(win('15.0.0')).toBe('Windows 11');
    expect(win('10.0.0')).toBe('Windows 10');
  });

  it('falls back to browser and system alone', () => {
    const details = detectDeviceDetails({ userAgent: FIREFOX_LINUX });

    expect(details).toMatchObject({
      model: null,
      os: 'Linux',
      browser: 'Firefox',
    });
  });

  it('ignores an empty model', () => {
    expect(
      detectDeviceDetails({ userAgent: CHROME_ANDROID }, { model: '' }).model,
    ).toBeNull();
  });
});
