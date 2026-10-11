import { describe, expect, it } from 'vitest';
import { detectDeviceName, detectDeviceType } from '../domain/detect';

const CHROME_WINDOWS =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const EDGE_WINDOWS = `${CHROME_WINDOWS} Edg/126.0.0.0`;
const SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const SAFARI_IPAD =
  'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const SAFARI_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const CHROME_PIXEL =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36';
const CHROME_ANDROID_TABLET =
  'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const FIREFOX_LINUX =
  'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0';

describe('device type', () => {
  it('is desktop for a computer browser', () => {
    expect(detectDeviceType({ userAgent: CHROME_WINDOWS })).toBe('desktop');
    expect(detectDeviceType({ userAgent: FIREFOX_LINUX })).toBe('desktop');
  });

  it('is mobile for a phone', () => {
    expect(detectDeviceType({ userAgent: SAFARI_IPHONE })).toBe('mobile');
    expect(detectDeviceType({ userAgent: CHROME_PIXEL })).toBe('mobile');
  });

  it('is tablet for an iPad and an Android tablet', () => {
    expect(detectDeviceType({ userAgent: SAFARI_IPAD })).toBe('tablet');
    expect(detectDeviceType({ userAgent: CHROME_ANDROID_TABLET })).toBe(
      'tablet',
    );
  });

  it('is tablet for an iPad posing as a Mac', () => {
    expect(detectDeviceType({ userAgent: SAFARI_MAC, maxTouchPoints: 5 })).toBe(
      'tablet',
    );
    expect(detectDeviceType({ userAgent: SAFARI_MAC })).toBe('desktop');
  });

  it('trusts the client hint for mobile', () => {
    expect(
      detectDeviceType({
        userAgent: CHROME_WINDOWS,
        userAgentData: { mobile: true },
      }),
    ).toBe('mobile');
  });
});

describe('device name', () => {
  it('reads browser and system from the user agent', () => {
    expect(detectDeviceName({ userAgent: CHROME_WINDOWS })).toBe(
      'Chrome on Windows',
    );
    expect(detectDeviceName({ userAgent: EDGE_WINDOWS })).toBe(
      'Edge on Windows',
    );
    expect(detectDeviceName({ userAgent: SAFARI_IPHONE })).toBe(
      'Safari on iOS',
    );
    expect(detectDeviceName({ userAgent: CHROME_PIXEL })).toBe(
      'Chrome on Android',
    );
    expect(detectDeviceName({ userAgent: FIREFOX_LINUX })).toBe(
      'Firefox on Linux',
    );
  });

  it('names an iPad posing as a Mac after iOS', () => {
    expect(detectDeviceName({ userAgent: SAFARI_MAC, maxTouchPoints: 5 })).toBe(
      'Safari on iOS',
    );
  });

  it('prefers client hints when the browser sends them', () => {
    expect(
      detectDeviceName({
        userAgent: CHROME_WINDOWS,
        userAgentData: {
          platform: 'Windows',
          brands: [
            { brand: 'Not/A)Brand', version: '8' },
            { brand: 'Chromium', version: '126' },
            { brand: 'Microsoft Edge', version: '126' },
          ],
        },
      }),
    ).toBe('Edge on Windows');
  });

  it('falls back when nothing is recognised', () => {
    expect(detectDeviceName({ userAgent: '' })).toBe('Unknown device');
  });
});
