import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  acceptAllPreferences,
  defaultPreferences,
  toggleCategoryPreference,
} from '../core/consent';
import type {
  ConsentCategoryId,
  ConsentPreferences,
  CookiesView,
} from '../domain/models';
import {
  getConsentServerSnapshot,
  readConsent,
  subscribeToConsent,
  writeConsent,
} from '../integration/storage';

const SAVED_TOAST_DURATION_MS = 5000;

type UseCookieConsent = {
  view: CookiesView | null;
  preferences: ConsentPreferences;
  hasConsented: boolean;
  showSavedToast: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  dismissBanner: () => void;
  toggleCategory: (id: ConsentCategoryId) => void;
  rejectOptional: () => void;
  savePreferences: () => void;
  acceptAll: () => void;
  dismissSavedToast: () => void;
};

export const useCookieConsent = (): UseCookieConsent => {
  // Bridges to localStorage through hydration without a mismatch: the server
  // (and the client's hydration pass) always see `null`, then React swaps in
  // the real snapshot right after hydrating.
  const storedConsent = useSyncExternalStore(
    subscribeToConsent,
    readConsent,
    getConsentServerSnapshot,
  );
  const hasConsented = storedConsent !== null;

  const [manualView, setManualView] = useState<CookiesView | null | undefined>(
    undefined,
  );
  const [preferences, setPreferences] =
    useState<ConsentPreferences>(defaultPreferences);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const view: CookiesView | null =
    manualView !== undefined ? manualView : hasConsented ? null : 'banner';

  useEffect(() => {
    if (!showSavedToast) return;

    const timeout = window.setTimeout(
      () => setShowSavedToast(false),
      SAVED_TOAST_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [showSavedToast]);

  const openPreferences = () => {
    setPreferences(storedConsent?.preferences ?? defaultPreferences);
    setManualView('preferences');
  };

  const consent = (next: ConsentPreferences) => {
    writeConsent(next);
    setPreferences(next);
    setManualView(null);
    setShowSavedToast(true);
  };

  return {
    view,
    preferences,
    hasConsented,
    showSavedToast,
    openPreferences,
    closePreferences: () => setManualView(hasConsented ? null : 'banner'),
    dismissBanner: () => setManualView(null),
    toggleCategory: (id) =>
      setPreferences((prev) => toggleCategoryPreference(prev, id)),
    rejectOptional: () => consent(defaultPreferences),
    savePreferences: () => consent(preferences),
    acceptAll: () => consent(acceptAllPreferences()),
    dismissSavedToast: () => setShowSavedToast(false),
  };
};
