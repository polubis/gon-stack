import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@repo/react-kit/cn';
import { useModalMounted } from '@/shared/router/modal-stack';
import {
  RECURRING_SCOPES,
  type RecurringScope,
} from '@/shared/recurring/occurrences';
import { Button } from '@/shared/ui/controls';
import { ModalFooter, MODAL_PADDING } from '@/shared/ui/modal-footer';

type Action = 'edit' | 'delete';

const VERB: Record<Action, string> = { edit: 'Edytuj', delete: 'Usuń' };

/** What each scope reaches, said the same way for expenses and tasks. */
const OPTIONS: Record<
  RecurringScope,
  { label: (action: Action) => string; hint: string }
> = {
  all: {
    label: (action) => `${VERB[action]} wszystkie`,
    hint: 'Cała seria: wcześniejsze, ta i następne.',
  },
  this: {
    label: (action) => `${VERB[action]} tylko ten`,
    hint: 'Tylko to jedno wystąpienie, reszta serii bez zmian.',
  },
  thisAndFollowing: {
    label: (action) => `${VERB[action]} ten i następne`,
    hint: 'To wystąpienie i wszystkie kolejne. Wcześniejsze zostają.',
  },
  following: {
    label: (action) => `${VERB[action]} tylko następne`,
    hint: 'Kolejne wystąpienia, bez tego. Ten zostaje jak jest.',
  },
};

/**
 * Asks how far a change of one recurring occurrence reaches. The same four
 * choices for editing and deleting, for expenses and for tasks; counting of
 * the occurrences is not touched, only what the change applies to.
 */
export const RecurringScopeDialog = ({
  modal,
  action,
  title,
  subject,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  /** Its id in the URL modal stack; omitted when the caller holds it open itself. */
  modal?: string;
  action: Action;
  title: string;
  /** Names what is changed. */
  subject: string;
  confirmLabel: string;
  onConfirm: (scope: RecurringScope) => void;
  onClose: () => void;
}) => {
  useModalMounted(modal ?? '', modal !== undefined);
  const [scope, setScope] = useState<RecurringScope>('this');
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="ui:scope-dialog"
          className={`fixed inset-x-4 bottom-[calc(var(--kb-inset,0rem)+1rem)] z-(--z-modal) mx-auto max-h-[calc(100dvh-var(--kb-inset,0rem)-2rem)] max-w-md overflow-y-auto scroll-in-radius rounded-4xl border border-line bg-card ${MODAL_PADDING} focus:outline-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2`}
        >
          <Dialog.Title className="text-base font-semibold">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {subject}
          </Dialog.Description>
          <fieldset className="mt-3 min-w-0">
            <legend className="sr-only">Zakres zmiany</legend>
            <div className="flex flex-col gap-2">
              {RECURRING_SCOPES.map((value) => (
                <label
                  key={value}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                    value === scope
                      ? 'border-brand bg-brand-soft'
                      : 'border-line-strong hover:bg-hover-soft',
                  )}
                >
                  <input
                    type="radio"
                    name="recurring-scope"
                    value={value}
                    data-e2e={`ui:scope:${value}`}
                    checked={value === scope}
                    onChange={() => setScope(value)}
                    className="mt-1 accent-brand"
                  />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {OPTIONS[value].label(action)}
                    </span>
                    <span className="block text-xs text-ink-soft">
                      {OPTIONS[value].hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <ModalFooter className="flex justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto"
              data-e2e="ui:scope-cancel"
              onClick={onClose}
            >
              Anuluj
            </Button>
            <Button
              variant={action === 'delete' ? 'danger' : 'primary'}
              className="w-auto"
              data-e2e="ui:scope-confirm"
              onClick={() => onConfirm(scope)}
            >
              {confirmLabel}
            </Button>
          </ModalFooter>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
