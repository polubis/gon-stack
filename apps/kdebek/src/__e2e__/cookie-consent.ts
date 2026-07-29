import type { Page } from '@playwright/test';
import type { ConsentPreferences } from '@/shared/policy/cookies/domain/models';

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
          version: 1,
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
    functional: true,
    marketing: true,
  });
