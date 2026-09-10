import { CheckCircle2, X } from 'lucide-react';
import { copy } from './copy';

type Props = {
  open: boolean;
  onDismiss: () => void;
};

export const SavedToast = ({ open, onDismiss }: Props) => {
  if (!open) return null;

  return (
    <div
      role="status"
      data-e2e="cookies:saved-toast"
      className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-emerald-700 bg-emerald-950/90 px-4 py-3 shadow-lg backdrop-blur sm:inset-x-auto sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2"
    >
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-emerald-400"
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium text-emerald-100">
        {copy.saved.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.saved.dismissLabel}
        data-e2e="cookies:saved-dismiss"
        className="shrink-0 rounded-full p-1 text-emerald-300 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
