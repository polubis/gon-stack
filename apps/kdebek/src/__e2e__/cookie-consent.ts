import type { Page } from '@playwright/test';
import type { ConsentPreferences } from '@/shared/cookies/domain/models';

export const COOKIE_CONSENT_STORAGE_KEY = 'kdebek:cookie-consent';

// Seeding consent up front means the cookie dialog never mounts, so tests
// that aren't about the dialog itself don't have to race its
// requestIdleCallback-gated reveal or fight its focus trap.
export const seedConsent = (page: Page, preferences: ConsentPreferences) =>
  page.addInitScript(
    ({ key, preferences }) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          preferences,
          updatedAt: new Date().toISOString(),
        }),
      );
    },
    { key: COOKIE_CONSENT_STORAGE_KEY, preferences },
  );

export const seedAcceptedConsent = (page: Page) =>
  seedConsent(page, {
    necessary: true,
    performance: true,
  });

// A consent record older than the 12-month validity window, with optional
// categories granted: it must be ignored and the banner must ask again.
export const seedExpiredConsent = (page: Page) =>
  page.addInitScript(
    ({ key }) => {
      const thirteenMonthsMs = 395 * 24 * 60 * 60 * 1000;

      window.localStorage.setItem(
        key,
        JSON.stringify({
          version: 2,
          preferences: { necessary: true, performance: true },
          updatedAt: new Date(Date.now() - thirteenMonthsMs).toISOString(),
        }),
      );
    },
    { key: COOKIE_CONSENT_STORAGE_KEY },
  );
