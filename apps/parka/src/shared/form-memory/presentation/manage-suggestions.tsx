import { useState, type FormEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Check, Pencil, Store, Trash2, X } from 'lucide-react';
import {
  closeModal,
  openModal,
  useModalMounted,
  useModalStack,
} from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { EmptyState } from '@/shared/ui/empty-state';
import { Skeleton } from '@/shared/ui/skeleton';
import { Toast } from '@/shared/ui/toast';
import {
  isTaken,
  rankSuggestions,
  sameValue,
  type SuggestionField,
} from '../domain/suggestions';
import type { useSuggestions } from './use-suggestions';

const COPY: Record<
  SuggestionField,
  { title: string; description: string; empty: string; deleteNote: string }
> = {
  merchant: {
    title: 'Sklepy',
    description: 'Zmień nazwę lub usuń zapamiętane sklepy.',
    empty: 'Sklepy pojawią się tu po zapisaniu wydatku.',
    deleteNote:
      'Sklep zniknie z podpowiedzi. Zapisane wydatki zostają bez zmian.',
  },
  paymentMethod: {
    title: 'Metody płatności',
    description: 'Zmień nazwę lub usuń zapamiętane metody płatności.',
    empty: 'Metody płatności pojawią się tu po zapisaniu wydatku.',
    deleteNote:
      'Metoda płatności zniknie z podpowiedzi. Zapisane wydatki zostają bez zmian.',
  },
};

const FIELDS = Object.keys(COPY) as SuggestionField[];
const MANAGE_PREFIX = 'manage-suggestions:';
const DELETE_PREFIX = 'delete-suggestion:';

const manageId = (field: SuggestionField) => `${MANAGE_PREFIX}${field}`;

const FRAME =
  'fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-h-[calc(100dvh-2rem)] max-w-md animate-pop-in rounded-2xl bg-card p-4 shadow-popover focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2';

const ICON_BUTTON =
  'grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

type Memory = ReturnType<typeof useSuggestions>;

/** Stacks the manage popup of one field on top of the open modals (URL-stacked). */
export const openManageSuggestions = (field: SuggestionField): void =>
  openModal(manageId(field));

const ManageDialog = ({
  modal,
  field,
  memory,
}: {
  modal: string;
  field: SuggestionField;
  memory: Memory;
}) => {
  useModalMounted(modal);
  const copy = COPY[field];
  const rows = rankSuggestions(memory.items, field, '');
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [showError, setShowError] = useState(false);

  const trimmed = draft.trim();
  const error = !trimmed
    ? 'Podaj nazwę.'
    : editing !== null && isTaken(memory.items, field, editing, trimmed)
      ? 'Taka nazwa już istnieje.'
      : null;

  const startEdit = (value: string) => {
    setEditing(value);
    setDraft(value);
    setShowError(false);
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    if (editing === null) return;
    if (error) {
      setShowError(true);
      return;
    }
    if (trimmed !== editing) memory.rename(field, editing, trimmed);
    setEditing(null);
  };

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
          data-e2e="form-memory:manage-dialog"
          className={`${FRAME} overflow-y-auto`}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                {copy.title}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-ink-soft">
                {copy.description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {!memory.loaded ? (
            <div className="space-y-2" aria-busy="true">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              data-e2e="form-memory:manage-empty"
              icon={Store}
              title="Nic tu jeszcze nie ma"
              description={copy.empty}
              action={
                <Button
                  variant="ghost"
                  className="w-auto"
                  onClick={() => closeModal(modal)}
                >
                  Gotowe
                </Button>
              }
            />
          ) : (
            <ul
              data-e2e="form-memory:manage-list"
              aria-label={copy.title}
              className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card"
            >
              {rows.map((row) => (
                <li
                  key={row.value}
                  data-e2e={`form-memory:manage-row:${row.value}`}
                  className="border-b border-line last:border-0"
                >
                  {editing !== null && sameValue(editing, row.value) ? (
                    <form
                      onSubmit={save}
                      noValidate
                      className="flex flex-col gap-1 px-3 py-2"
                    >
                      <div className="flex items-center gap-1">
                        <div className="min-w-0 flex-1">
                          <ClearableInput
                            autoFocus
                            value={draft}
                            maxLength={100}
                            aria-label={`Nowa nazwa: ${row.value}`}
                            aria-invalid={showError && error ? true : undefined}
                            data-e2e="form-memory:manage-edit-input"
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                e.preventDefault();
                                e.stopPropagation();
                                setEditing(null);
                              }
                            }}
                          />
                        </div>
                        <button
                          type="submit"
                          aria-label="Zapisz nazwę"
                          data-e2e="form-memory:manage-edit-save"
                          className={`${ICON_BUTTON} text-brand`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label="Anuluj zmianę nazwy"
                          onClick={() => setEditing(null)}
                          className={`${ICON_BUTTON} text-ink-soft`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      {showError && error ? (
                        <p
                          role="alert"
                          data-e2e="form-memory:manage-edit-error"
                          className="text-sm text-danger"
                        >
                          {error}
                        </p>
                      ) : null}
                    </form>
                  ) : (
                    <div className="flex items-center gap-1 py-1 pl-3 pr-1">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {row.value}
                      </span>
                      {row.useCount > 0 ? (
                        <span className="shrink-0 text-xs text-ink-soft tabular-nums">
                          {row.useCount}×
                        </span>
                      ) : null}
                      <button
                        type="button"
                        aria-label={`Zmień nazwę: ${row.value}`}
                        data-e2e={`form-memory:manage-edit:${row.value}`}
                        onClick={() => startEdit(row.value)}
                        className={`${ICON_BUTTON} text-ink-soft`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Usuń: ${row.value}`}
                        data-e2e={`form-memory:manage-delete:${row.value}`}
                        onClick={() =>
                          openModal(`${DELETE_PREFIX}${field}:${row.value}`)
                        }
                        className={`${ICON_BUTTON} text-danger`}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Dialog.Content>
        {memory.notice ? (
          <div className="pointer-events-auto">
            <Toast
              key={memory.notice.id}
              data-e2e="form-memory:toast"
              notice={memory.notice}
              onClose={memory.dismissNotice}
            />
          </div>
        ) : null}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const DeleteDialog = ({
  modal,
  field,
  value,
  onConfirm,
}: {
  modal: string;
  field: SuggestionField;
  value: string;
  onConfirm: () => void;
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
        <Dialog.Content data-e2e="form-memory:delete-dialog" className={FRAME}>
          <Dialog.Title className="text-base font-semibold">
            Usunąć „{value}”?
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {COPY[field].deleteNote}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              className="w-auto"
              onClick={() => closeModal(modal)}
            >
              Anuluj
            </Button>
            <Button
              variant="danger"
              className="w-auto"
              data-e2e="form-memory:delete-confirm"
              onClick={onConfirm}
            >
              Usuń
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

/**
 * Renders the open manage / delete-confirmation popups of the remembered
 * values, stacked over whatever is already open. State lives in the URL.
 */
export const ManageSuggestions = ({ memory }: { memory: Memory }) => {
  const stack = useModalStack();
  return (
    <>
      {stack.map((modal) => {
        const manage = FIELDS.find((field) => modal === manageId(field));
        if (manage)
          return (
            <ManageDialog
              key={modal}
              modal={modal}
              field={manage}
              memory={memory}
            />
          );
        if (!modal.startsWith(DELETE_PREFIX)) return null;
        const rest = modal.slice(DELETE_PREFIX.length);
        const field = FIELDS.find((f) => rest.startsWith(`${f}:`));
        if (!field) return null;
        const value = rest.slice(field.length + 1);
        return (
          <DeleteDialog
            key={modal}
            modal={modal}
            field={field}
            value={value}
            onConfirm={() => {
              memory.remove(field, value);
              closeModal(modal);
            }}
          />
        );
      })}
    </>
  );
};
