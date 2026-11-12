import type { ReactNode, RefObject } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { E2eId } from '@/__e2e__/selectors';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Pinned at the top, under the title (e.g. a filter input that gets focus). */
  header?: ReactNode;
  /** Control that opened the picker: gets focus back on close. */
  returnFocus?: RefObject<HTMLElement | null>;
  children: ReactNode;
  'data-e2e'?: E2eId;
};

/**
 * Mobile form of a select: a full-screen modal of fixed height, so the
 * content never jumps while filtering. Opens through `usePopoverOpen`.
 */
export const PickerScreen = ({
  open,
  onClose,
  title,
  header,
  returnFocus,
  children,
  'data-e2e': e2e,
}: Props) => (
  <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
    <Dialog.Portal>
      <Dialog.Content
        data-e2e={e2e}
        aria-describedby={undefined}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          returnFocus?.current?.focus();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          const target = e.currentTarget as HTMLElement;
          (
            target.querySelector<HTMLElement>('[data-picker-focus]') ?? target
          ).focus();
        }}
        className="fixed inset-0 z-(--z-modal) flex h-dvh w-full animate-pop-in flex-col bg-card focus:outline-none motion-reduce:animate-none"
      >
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Dialog.Title className="min-w-0 flex-1 truncate text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Close
            aria-label="Zamknij"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Dialog.Close>
        </div>
        {header ? (
          <div className="border-b border-line p-4">{header}</div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
