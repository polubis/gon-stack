import { useEffect, useEffectEvent } from 'react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';

const AUTO_DISMISS_MS = 4000;

type Props = {
  tone: 'success' | 'error';
  message: string;
  onDismiss: () => void;
  'data-e2e'?: E2eId;
};

/** Transient feedback for create/update/delete. Mount with a fresh `key` per message. */
export const Toast = ({
  tone,
  message,
  onDismiss,
  'data-e2e': dataE2e,
}: Props) => {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    const timer = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      data-e2e={dataE2e}
      className={cn(
        'fixed inset-x-4 bottom-24 z-(--z-modal) mx-auto max-w-md rounded-xl px-4 py-3 text-sm font-medium shadow-lg',
        tone === 'error'
          ? 'border border-danger-line bg-danger-soft text-danger'
          : 'bg-brand text-on-brand',
      )}
    >
      {message}
    </div>
  );
};
