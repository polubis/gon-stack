import { useEffect, useState } from 'react';
import {
  acceptAllPreferences,
  defaultPreferences,
  toggleCategoryPreference,
} from '../core/consent';
import type {
  ConsentCategoryId,
  ConsentPreferences,
  CookiesView,
  PolicyOrigin,
} from '../domain/models';
import { readConsent, writeConsent } from '../integration/storage';

export const useConsent = () => {
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(defaultPreferences);
  const [rawView, setView] = useState<CookiesView | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [policyOrigin, setPolicyOrigin] = useState<PolicyOrigin>('banner');

  // Revealed once the browser is idle, not the mount effect itself: Radix's
  // focus trap marks sibling Astro islands aria-hidden as soon as the dialog
  // opens, and those islands hydrate on their own independent timeline, so
  // opening synchronously on mount can race their hydration and log a false
  // mismatch. Waiting for idle time guarantees it always happens after, and
  // adapts to the page instead of guessing a fixed delay.
  useEffect(() => {
    const reveal = () => {
      const stored = readConsent();

      if (stored) {
        setPreferences(stored.preferences);
        setHasConsented(true);
      } else {
        setView('banner');
      }

      setIsReady(true);
    };

    const handle = window.requestIdleCallback(reveal, { timeout: 2000 });

    return () => window.cancelIdleCallback(handle);
  }, []);

  const view = isReady ? rawView : null;

  const acceptAll = () => {
    const next = acceptAllPreferences();

    setPreferences(next);
    writeConsent(next);
    setHasConsented(true);
    setView(null);
  };

  const savePreferences = () => {
    writeConsent(preferences);
    setHasConsented(true);
    setView(null);
  };

  const toggleCategory = (id: ConsentCategoryId) => {
    setPreferences((current) => toggleCategoryPreference(current, id));
  };

  const openPreferences = () => setView('preferences');
  const openSettings = () => setView('preferences');
  const backFromPreferences = () => setView(hasConsented ? null : 'banner');

  const openPolicyFromBanner = () => {
    setPolicyOrigin('banner');
    setView('policy');
  };

  const openPolicyFromPreferences = () => {
    setPolicyOrigin('preferences');
    setView('policy');
  };

  const backFromPolicy = () => setView(policyOrigin);

  return {
    preferences,
    view,
    showReopenTrigger: hasConsented && view === null,
    acceptAll,
    savePreferences,
    toggleCategory,
    openPreferences,
    openSettings,
    backFromPreferences,
    openPolicyFromBanner,
    openPolicyFromPreferences,
    backFromPolicy,
  };
};
