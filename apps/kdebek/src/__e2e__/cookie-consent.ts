import type { Page } from '@playwright/test';

export const COOKIE_CONSENT_STORAGE_KEY = 'kdebek:cookie-consent';

// Seeding consent up front means the cookie dialog never mounts, so tests
// that aren't about the dialog itself don't have to race its
// requestIdleCallback-gated reveal or fight its focus trap.
export const seedAcceptedConsent = (page: Page) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        preferences: {
          necessary: true,
          performance: true,
          functional: true,
          marketing: true,
        },
        updatedAt: new Date().toISOString(),
      }),
    );
  }, COOKIE_CONSENT_STORAGE_KEY);
