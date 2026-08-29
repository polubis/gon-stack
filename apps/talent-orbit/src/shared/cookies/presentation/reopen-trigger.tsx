import { Cookie } from 'lucide-react';
import { copy } from './copy';

type Props = {
  visible: boolean;
  onClick: () => void;
};

export const ReopenTrigger = ({ visible, onClick }: Props) => {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copy.reopenTrigger.ariaLabel}
      data-e2e="cookies:reopen"
      className="fixed bottom-4 left-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-orange-400 shadow-lg hover:bg-slate-800 sm:bottom-6 sm:left-6"
    >
      <Cookie className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};
