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
    className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl shadow-black/40 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:mx-0 sm:max-w-sm sm:p-6"
  >
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
        <Cookie className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="flex-1 text-base font-semibold text-white">
        {copy.banner.title}
      </h2>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.banner.dismissLabel}
        data-e2e="cookies:dismiss"
        className="hidden shrink-0 rounded-full p-1 text-slate-400 hover:text-white sm:block"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>

    <p className="order-1 text-sm leading-relaxed text-slate-400">
      {copy.banner.description}
    </p>

    <a
      href={privacyPolicyUrl}
      data-e2e="cookies:policy-link"
      className="order-2 inline-flex w-fit items-center gap-1 text-sm font-medium text-orange-400 underline underline-offset-2 sm:order-4"
    >
      {copy.banner.privacyPolicyLabel}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
    </a>

    <div className="order-3 flex gap-3 sm:order-2">
      <button
        type="button"
        onClick={onRejectOptional}
        data-e2e="cookies:reject-optional"
        className="flex-1 rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {copy.banner.rejectOptional}
      </button>
      <button
        type="button"
        onClick={onAcceptAll}
        data-e2e="cookies:accept-all"
        className="flex-1 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-400"
      >
        {copy.banner.acceptAll}
      </button>
    </div>

    <button
      type="button"
      onClick={onManagePreferences}
      data-e2e="cookies:manage-preferences"
      className="order-4 w-full rounded-lg border border-slate-700 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800 sm:order-3 sm:w-fit sm:border-0 sm:p-0 sm:font-medium sm:text-orange-400 sm:underline sm:underline-offset-2 sm:hover:bg-transparent"
    >
      {copy.banner.managePreferences}
    </button>
  </div>
);
