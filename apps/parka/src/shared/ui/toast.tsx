import { useEffect, useEffectEvent } from 'react';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';

const AUTO_DISMISS_MS = 4000;

export type ToastNotice =
  | {
      tone: 'success';
      message: string;
      /** Link-like follow-up; the toast then stays until closed. */
      action?: { label: string; run: () => void };
    }
  | {
      tone: 'error';
      title: string;
      /** Stable technical code, e.g. `LIMIT_CREATE_FAILED`. */
      code: string;
      description: string;
      /** Re-runs the action that failed. */
      retry?: () => void;
    };

type Props = {
  notice: ToastNotice;
  onClose: () => void;
  /** Extra classes, e.g. to move it clear of a popup. */
  className?: string;
  'data-e2e'?: E2eId;
};

/**
 * Transient feedback for create/update/delete. Mount with a fresh `key` per
 * message. Success: plain message, auto-dismissed. Failure pattern:
 * `title : tech-code : description : close : retry`, kept until closed.
 */
export const Toast = ({
  notice,
  onClose,
  className,
  'data-e2e': dataE2e,
}: Props) => {
  const close = useEffectEvent(onClose);
  const sticky =
    notice.tone === 'error' || (notice.tone === 'success' && !!notice.action);

  useEffect(() => {
    if (sticky) return;
    const timer = setTimeout(close, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [sticky]);

  return (
    <div
      role={notice.tone === 'error' ? 'alert' : 'status'}
      data-e2e={dataE2e}
      // Keep an open modal from treating the toast as an outside click/focus.
      onPointerDown={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      className={cn(
        'pointer-events-auto fixed inset-x-4 bottom-24 z-(--z-toast) mx-auto max-w-md rounded-xl px-4 py-3 text-sm shadow-lg',
        notice.tone === 'error'
          ? 'border border-danger-line bg-danger-soft text-danger'
          : 'bg-brand font-medium text-on-brand',
        className,
      )}
    >
      {notice.tone === 'error' ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold text-ink">{notice.title}</p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij"
              className="shrink-0 rounded-full p-0.5 text-ink-soft hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="font-mono text-xs">{notice.code}</p>
          <p className="text-ink-soft">{notice.description}</p>
          {notice.retry ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  notice.retry?.();
                }}
                className="rounded-lg border border-danger-line bg-card px-3 py-1 text-xs font-semibold text-danger hover:bg-danger-faint"
              >
                Spróbuj ponownie
              </button>
            </div>
          ) : null}
        </div>
      ) : notice.action ? (
        <div className="flex items-center justify-between gap-3">
          <p>{notice.message}</p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                notice.action?.run();
              }}
              className="rounded-lg bg-card px-3 py-1 text-xs font-semibold text-brand hover:bg-hover"
            >
              {notice.action.label}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Zamknij"
              className="rounded-full p-0.5 hover:opacity-80"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : (
        notice.message
      )}
    </div>
  );
};
