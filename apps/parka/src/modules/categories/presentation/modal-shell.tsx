import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import type { CategoriesE2eId } from '../configuration/e2e-ids';

/** Animated popup frame of the category modals: title, close, URL-stack aware. */
export const ModalShell = ({
  modal,
  title,
  description,
  children,
  'data-e2e': dataE2e,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  title: string;
  description: string;
  children: ReactNode;
  'data-e2e': CategoriesE2eId;
}) => {
  useModalMounted(modal);
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) closeModal(modal);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e={dataE2e}
          onOpenAutoFocus={(e) => {
            // Focus the dialog itself: no input grabs focus, so no mobile keyboard pops up.
            e.preventDefault();
            if (e.target instanceof HTMLElement) e.target.focus();
          }}
          className="fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md animate-pop-in touch-pan-y overflow-y-auto overscroll-contain rounded-2xl bg-card p-4 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-ink-soft">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
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
};
