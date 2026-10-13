import type { DeviceDetails, DeviceType } from './models';

/** The parts of `navigator` that tell the device apart; all optional. */
export type DeviceSignals = {
  userAgent: string;
  maxTouchPoints?: number;
  userAgentData?: {
    mobile?: boolean;
    platform?: string;
    brands?: { brand: string; version: string }[];
  };
};

const BROWSER_BRANDS = [
  'Microsoft Edge',
  'Opera',
  'Brave',
  'Vivaldi',
  'Samsung Internet',
  'Google Chrome',
  'Firefox',
  'Safari',
] as const;

const BRAND_LABELS: Record<(typeof BROWSER_BRANDS)[number], string> = {
  'Microsoft Edge': 'Edge',
  Opera: 'Opera',
  Brave: 'Brave',
  Vivaldi: 'Vivaldi',
  'Samsung Internet': 'Samsung Internet',
  'Google Chrome': 'Chrome',
  Firefox: 'Firefox',
  Safari: 'Safari',
};

const UA_BROWSERS: [RegExp, string][] = [
  [/Edg(e|A|iOS)?\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser\//, 'Samsung Internet'],
  [/Firefox\/|FxiOS\//, 'Firefox'],
  [/Chrome\/|CriOS\//, 'Chrome'],
  [/Safari\//, 'Safari'],
];

const UA_SYSTEMS: [RegExp, string][] = [
  [/Windows/, 'Windows'],
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/CrOS/, 'ChromeOS'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/Linux|X11/, 'Linux'],
];

const firstMatch = (table: [RegExp, string][], ua: string): string | null =>
  table.find(([pattern]) => pattern.test(ua))?.[1] ?? null;

const systemOf = ({
  userAgent,
  maxTouchPoints = 0,
}: DeviceSignals): string | null => {
  // iPadOS reports itself as a Mac, only the touch screen gives it away.
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'iOS';
  return firstMatch(UA_SYSTEMS, userAgent);
};

const platformLabel = (platform: string): string =>
  platform === 'macOS' || platform === 'Windows' || platform === 'Android'
    ? platform
    : platform === 'Chrome OS'
      ? 'ChromeOS'
      : platform;

const browserOf = ({
  userAgent,
  userAgentData,
}: DeviceSignals): string | null => {
  const brands = userAgentData?.brands?.map((b) => b.brand) ?? [];
  const brand = BROWSER_BRANDS.find((b) => brands.includes(b));
  return brand ? BRAND_LABELS[brand] : firstMatch(UA_BROWSERS, userAgent);
};

export const detectDeviceType = (signals: DeviceSignals): DeviceType => {
  const { userAgent: ua, maxTouchPoints = 0, userAgentData } = signals;
  const isIpad =
    /iPad/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1);
  const isAndroidTablet = /Android/.test(ua) && !/Mobile/.test(ua);
  if (isIpad || isAndroidTablet || /Tablet|PlayBook|Silk/.test(ua)) {
    return 'tablet';
  }
  if (userAgentData?.mobile || /Mobi|iPhone|iPod|Android/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/** Readable device name such as "Chrome on Windows". */
export const detectDeviceName = (signals: DeviceSignals): string => {
  const browser = browserOf(signals);
  const platform = signals.userAgentData?.platform;
  const system = platform
    ? (systemOf(signals) ?? platformLabel(platform))
    : systemOf(signals);
  if (browser && system) return `${browser} on ${system}`;
  return browser ?? system ?? 'Unknown device';
};

/** Values only `getHighEntropyValues` gives, when the browser allows them. */
export type DeviceHints = { model?: string; platformVersion?: string };

const major = (version: string | undefined): number | null => {
  const value = Number.parseInt(version ?? '', 10);
  return Number.isNaN(value) ? null : value;
};

const systemVersion = (
  system: string,
  { userAgent }: DeviceSignals,
  { platformVersion }: DeviceHints,
): number | null => {
  if (system === 'iOS') return major(/OS (\d+)[_.]/.exec(userAgent)?.[1]);
  if (system === 'Android')
    return (
      major(platformVersion) ?? major(/Android (\d+)/.exec(userAgent)?.[1])
    );
  // Chromium reports 13+ for Windows 11 and 0-10 for Windows 10 and older.
  if (system === 'Windows') {
    const version = major(platformVersion);
    return version === null ? null : version >= 13 ? 11 : 10;
  }
  return system === 'macOS' ? major(platformVersion) : null;
};

/** Model, system version, browser and screen of the running browser. */
export const detectDeviceDetails = (
  signals: DeviceSignals,
  hints: DeviceHints = {},
  screen?: { width: number; height: number },
): DeviceDetails => {
  const platform = signals.userAgentData?.platform;
  const system = platform
    ? (systemOf(signals) ?? platformLabel(platform))
    : systemOf(signals);
  const version = system ? systemVersion(system, signals, hints) : null;
  return {
    model: hints.model?.trim() || null,
    os: system ? (version === null ? system : `${system} ${version}`) : null,
    browser: browserOf(signals),
    screen:
      screen && screen.width > 0 && screen.height > 0
        ? `${screen.width}×${screen.height}`
        : null,
  };
};
