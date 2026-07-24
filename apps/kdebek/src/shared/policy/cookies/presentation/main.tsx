import * as Dialog from '@radix-ui/react-dialog';
import { Cookie } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import {
  Content as PrivacyPolicyContent,
  Intro as PrivacyPolicyIntro,
  copy as privacyCopy,
} from '../../privacy-policy';
import { categoryOrder } from '../core/consent';
import { CategoryRow } from './category-row';
import { copy } from './copy';
import { useConsent } from './use-consent';

/* =============================================================================
 * Component
 * ============================================================================= */

export const Cookies = () => {
  const consent = useConsent();

  return (
    <Dialog.Root open={consent.view !== null}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-cookies bg-overlay" />
        <Dialog.Content
          onEscapeKeyDown={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => event.preventDefault()}
          className={cn(
            'fixed inset-x-4 bottom-4 z-cookies mx-auto rounded-3xl bg-white py-6 pl-6 shadow-md focus:outline-none sm:py-8 sm:pl-8',
            consent.view === 'policy' ? 'max-w-3xl' : 'max-w-md',
          )}
        >
          {consent.view === 'banner' && (
            <div
              data-e2e="cookies:banner"
              className="flex flex-col gap-4 pr-6 sm:pr-8"
            >
              <Dialog.Title className="font-display text-xl italic text-secondary">
                {copy.banner.title}
              </Dialog.Title>
              <Dialog.Description className="text-sm leading-relaxed text-ink-light">
                {copy.banner.description}
              </Dialog.Description>
              <button
                type="button"
                data-e2e="cookies:policy-link"
                onClick={consent.openPolicyFromBanner}
                className="self-start text-left text-sm font-medium text-primary underline underline-offset-2"
              >
                {copy.banner.policyLinkLabel}
              </button>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  data-e2e="cookies:customize"
                  onClick={consent.openPreferences}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-secondary"
                >
                  {copy.banner.customize}
                </button>
                <button
                  type="button"
                  data-e2e="cookies:accept-all"
                  onClick={consent.acceptAll}
                  className="rounded-full bg-primary-dark px-5 py-2.5 text-sm font-bold text-white"
                >
                  {copy.banner.accept}
                </button>
              </div>
            </div>
          )}

          {consent.view === 'preferences' && (
            <div data-e2e="cookies:preferences" className="flex flex-col gap-4">
              <Dialog.Title className="pr-6 font-display text-xl italic text-secondary sm:pr-8">
                {copy.preferences.title}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {copy.preferences.description}
              </Dialog.Description>
              <div className="max-h-[50vh] overflow-y-auto pr-6 sm:pr-8">
                {categoryOrder.map((id) => (
                  <CategoryRow
                    key={id}
                    id={id}
                    checked={consent.preferences[id]}
                    onToggle={() => consent.toggleCategory(id)}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2 pr-6 sm:flex-row sm:justify-end sm:pr-8">
                <button
                  type="button"
                  data-e2e="cookies:back"
                  onClick={consent.backFromPreferences}
                  className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-secondary"
                >
                  {copy.preferences.back}
                </button>
                <button
                  type="button"
                  data-e2e="cookies:save-preferences"
                  onClick={consent.savePreferences}
                  className="rounded-full bg-primary-dark px-5 py-2.5 text-sm font-bold text-white"
                >
                  {copy.preferences.accept}
                </button>
              </div>
            </div>
          )}

          {consent.view === 'policy' && (
            <div data-e2e="cookies:policy" className="flex flex-col gap-4">
              <Dialog.Title className="sr-only">
                {privacyCopy.header.heading}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {privacyCopy.meta.description}
              </Dialog.Description>
              <div
                role="region"
                aria-label={privacyCopy.header.heading}
                tabIndex={0}
                className="max-h-[60vh] overflow-y-auto pr-6 sm:pr-8"
              >
                <PrivacyPolicyIntro />
                <div className="mt-10">
                  <PrivacyPolicyContent />
                </div>
              </div>
              <button
                type="button"
                data-e2e="cookies:back"
                onClick={consent.backFromPolicy}
                className="self-start rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-secondary"
              >
                {copy.preferences.back}
              </button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>

      {consent.showReopenTrigger && (
        <button
          type="button"
          data-e2e="cookies:reopen"
          aria-label={copy.reopenTrigger.ariaLabel}
          onClick={consent.openSettings}
          className="fixed bottom-4 left-4 z-cookies flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-line"
        >
          <Cookie className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </Dialog.Root>
  );
};
