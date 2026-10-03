import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

/** Footer of every popup: delete on the left, cancel and confirm on the right. */
export const DialogActions = ({
  danger,
  children,
}: {
  danger?: ReactNode;
  children: ReactNode;
}) => (
  <div className="mt-4 flex items-center gap-2">
    {danger}
    <div className="ml-auto flex gap-2">{children}</div>
  </div>
);

/** Popup shell shared by every editable row of the expenses list. */
export const DetailDialog = ({
  title,
  description,
  avatar,
  badge,
  onClose,
  children,
  'data-e2e': dataE2e,
}: {
  title: string;
  description: string;
  avatar?: ReactNode;
  badge?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  'data-e2e': 'dashboard:detail' | 'dashboard:recurring-dialog';
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
        data-e2e={dataE2e}
        className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-h-[calc(100dvh-2rem)] max-w-md overflow-y-auto rounded-2xl bg-card p-4 focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
      >
        <div className="mb-3 flex items-center gap-3">
          {avatar}
          <div className="min-w-0 flex-1">
            <Dialog.Title className="truncate text-base font-semibold">
              {title}
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
              {badge}
              {description}
            </Dialog.Description>
          </div>
          <Dialog.Close className="rounded-full px-2 py-1 text-sm text-ink-soft hover:bg-hover">
            Zamknij
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
