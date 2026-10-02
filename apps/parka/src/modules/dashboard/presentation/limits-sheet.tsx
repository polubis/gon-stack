import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { X } from 'lucide-react';

const FOCUSABLE = ':is(button, input, select, a[href]):not(:disabled)';

/** Keeps Tab / Shift+Tab cycling inside the dialog. */
const trapFocus = (event: KeyboardEvent, dialog: HTMLElement | null) => {
  const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE);
  if (!focusable?.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
};

/**
 * Panel laid over the limits card, same footprint: opening a form never
 * changes the card's height, so nothing around it moves.
 */
export const LimitsSheet = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current
      ?.querySelector<HTMLElement>(':is(input, select):not(:disabled)')
      ?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') trapFocus(e, ref.current);
      }}
      className="absolute inset-0 flex flex-col gap-3 overflow-y-auto rounded-2xl bg-card p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">{title}</h3>
        <button
          type="button"
          aria-label="Zamknij"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-full text-ink-soft hover:bg-hover-soft"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
};
