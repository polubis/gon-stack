import { Banner } from './banner';
import { PreferencesDialog } from './preferences-dialog';
import { ReopenTrigger } from './reopen-trigger';
import { SavedToast } from './saved-toast';
import { useCookieConsent } from './use-cookie-consent';

type Props = {
  privacyPolicyUrl: string;
};

export const CookieConsent = ({ privacyPolicyUrl }: Props) => {
  const consent = useCookieConsent();

  return (
    <>
      {consent.view === 'banner' && (
        <Banner
          privacyPolicyUrl={privacyPolicyUrl}
          onAcceptAll={consent.acceptAll}
          onRejectOptional={consent.rejectOptional}
          onManagePreferences={consent.openPreferences}
          onDismiss={consent.dismissBanner}
        />
      )}

      <PreferencesDialog
        open={consent.view === 'preferences'}
        preferences={consent.preferences}
        onOpenChange={(open) =>
          open ? consent.openPreferences() : consent.closePreferences()
        }
        onToggleCategory={consent.toggleCategory}
        onRejectOptional={consent.rejectOptional}
        onSavePreferences={consent.savePreferences}
        onAcceptAll={consent.acceptAll}
      />

      <SavedToast
        open={consent.showSavedToast}
        onDismiss={consent.dismissSavedToast}
      />

      <ReopenTrigger
        visible={consent.hasConsented && consent.view === null}
        onClick={consent.openPreferences}
      />
    </>
  );
};
