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
      className="fixed inset-x-4 top-4 z-(--z-modal) mx-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-card px-4 py-3 shadow-card sm:inset-x-auto sm:left-1/2 sm:max-w-sm sm:-translate-x-1/2"
    >
      <CheckCircle2
        className="h-5 w-5 shrink-0 text-brand"
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium text-ink">
        {copy.saved.message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={copy.saved.dismissLabel}
        data-e2e="cookies:saved-dismiss"
        className="shrink-0 rounded-full p-1 text-ink-soft hover:text-ink"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
