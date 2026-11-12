import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import type { E2eId } from '@/__e2e__/selectors';

export type ToastNotice =
  | {
      tone: 'success';
      message: string;
      /** Navigates somewhere; the toast then stays until closed or used. */
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

const STACK_ID = 'toast-stack';

/** One shared top container, so every mounted toast stacks instead of overlapping. */
const getStack = (): HTMLElement => {
  const existing = document.getElementById(STACK_ID);
  if (existing) return existing;
  const stack = document.createElement('div');
  stack.id = STACK_ID;
  // A live region is skipped when a modal hides the rest of the page.
  stack.setAttribute('aria-live', 'polite');
  stack.className =
    'pointer-events-none fixed inset-x-4 top-4 z-(--z-toast) mx-auto flex max-w-sm flex-col gap-2';
  document.body.appendChild(stack);
  return stack;
};

/**
 * Feedback for failures only: successes stay silent (the UI already shows
 * them). Failure pattern: `title : tech-code : description : close : retry`,
 * kept until closed. Mount with a fresh `key` per message; mounted toasts
 * stack at the top of the screen.
 */
export const Toast = ({
  notice,
  onClose,
  className,
  'data-e2e': dataE2e,
}: Props) => {
  if (notice.tone !== 'error') return null;

  return createPortal(
    <div
      role="alert"
      data-e2e={dataE2e}
      // Keep an open modal from treating the toast as an outside click/focus.
      onPointerDown={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      className={cn(
        'pointer-events-auto w-full rounded-2xl border border-line bg-card px-3 py-2 text-xs shadow-card',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
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
        <p className="font-mono text-ink-soft">{notice.code}</p>
        <p className="text-ink-soft">{notice.description}</p>
        {notice.retry ? (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onClose();
                notice.retry?.();
              }}
              className="rounded-full border border-danger-line bg-card px-3 py-1 font-semibold text-danger hover:bg-danger-faint"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    getStack(),
  );
};
