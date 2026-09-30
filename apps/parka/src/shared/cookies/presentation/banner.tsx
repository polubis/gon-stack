import { Cookie, ExternalLink, X } from 'lucide-react';
import { copy } from './copy';

type Props = {
  privacyPolicyUrl: string;
  onAcceptAll: () => void;
  onRejectOptional: () => void;
  onManagePreferences: () => void;
  onDismiss: () => void;
};

export const Banner = ({
  privacyPolicyUrl,
  onAcceptAll,
  onRejectOptional,
  onManagePreferences,
  onDismiss,
}: Props) => (
  <div
    role="region"
    aria-label={copy.banner.title}
    data-e2e="cookies:banner"
    className="fixed bottom-4 left-1/2 z-(--z-modal) flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 flex-col gap-4 overflow-y-auto rounded-2xl border border-line-strong bg-card p-5 shadow-popover sm:bottom-6 sm:max-w-2xl sm:p-6"
  >
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Cookie className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="flex-1 text-base font-semibold text-ink">
        {copy.banner.title}
      </h2>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.banner.dismissLabel}
        data-e2e="cookies:dismiss"
        className="hidden shrink-0 rounded-full p-1 text-ink-soft hover:text-ink sm:block"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <p className="text-sm leading-relaxed text-ink-soft">
      {copy.banner.description}
    </p>

    <a
      href={privacyPolicyUrl}
      data-e2e="cookies:policy-link"
      className="inline-flex w-fit items-center gap-1 text-sm font-medium text-brand underline underline-offset-2"
    >
      {copy.banner.privacyPolicyLabel}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>

    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onManagePreferences}
        data-e2e="cookies:manage-preferences"
        className="rounded-lg border border-line-strong px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-hover sm:flex-1"
      >
        {copy.banner.managePreferences}
      </button>
      <button
        type="button"
        onClick={onRejectOptional}
        data-e2e="cookies:reject-optional"
        className="rounded-lg border border-line-strong px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-hover sm:flex-1"
      >
        {copy.banner.rejectOptional}
      </button>
      <button
        type="button"
        onClick={onAcceptAll}
        data-e2e="cookies:accept-all"
        className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-on-brand hover:bg-brand-dark sm:flex-1"
      >
        {copy.banner.acceptAll}
      </button>
    </div>
  </div>
);
