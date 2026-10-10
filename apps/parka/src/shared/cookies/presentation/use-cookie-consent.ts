import { useEffect, useState, useSyncExternalStore } from 'react';
import { useModal, useModalMounted } from '@/shared/router/modal-stack';
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

/** URL id of the preferences dialog (see `shared/router/modal-stack`). */
const PREFERENCES_MODAL = 'cookies';

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
  // Unsaved toggles; null = show what is stored (also after a URL deep link).
  const [draft, setDraft] = useState<ConsentPreferences | null>(null);
  const preferences = draft ?? storedConsent?.preferences ?? defaultPreferences;
  const [showSavedToast, setShowSavedToast] = useState(false);

  const dialog = useModal(PREFERENCES_MODAL);
  useModalMounted(PREFERENCES_MODAL, dialog.isOpen);

  const view: CookiesView | null = dialog.isOpen
    ? 'preferences'
    : manualView !== undefined
      ? manualView
      : hasConsented
        ? null
        : 'banner';

  useEffect(() => {
    if (!showSavedToast) return;

    const timeout = window.setTimeout(
      () => setShowSavedToast(false),
      SAVED_TOAST_DURATION_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [showSavedToast]);

  const consent = (next: ConsentPreferences) => {
    writeConsent(next);
    setDraft(null);
    setManualView(null);
    dialog.close();
    setShowSavedToast(true);
  };

  return {
    view,
    preferences,
    hasConsented,
    showSavedToast,
    openPreferences: () => {
      setDraft(null);
      dialog.open();
    },
    closePreferences: dialog.close,
    dismissBanner: () => setManualView(null),
    toggleCategory: (id) => setDraft(toggleCategoryPreference(preferences, id)),
    rejectOptional: () => consent(defaultPreferences),
    savePreferences: () => consent(preferences),
    acceptAll: () => consent(acceptAllPreferences()),
    dismissSavedToast: () => setShowSavedToast(false),
  };
};
