import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

/** The expense forms live in a popup; closing it leaves the page (`onClose`). */
export const FormModal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) => (
  <Dialog.Root
    open
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
      <Dialog.Content
        data-e2e="expenses-management:modal"
        aria-describedby={undefined}
        className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto flex max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-xl animate-pop-in flex-col gap-4 overflow-y-auto rounded-4xl border border-line bg-card p-5 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
      >
        <div className="flex items-center gap-3">
          <Dialog.Title className="min-w-0 flex-1 truncate text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Close
            data-e2e="expenses-management:modal-close"
            aria-label="Zamknij"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
