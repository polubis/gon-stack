import { useState, type FormEvent } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { closeModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { NAME_MAX_LENGTH } from '../configuration/constraints';
import { newStatusId } from '../domain/ids';
import type { Status } from '../domain/models';
import { DONE_NAME, IN_PROGRESS, OPEN_NAME } from '../domain/status';
import { useContext } from './context';
import { ModalShell } from './modal-shell';

const MAX_STATUSES = 10;

const ICON_BUTTON =
  'grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-40 disabled:hover:bg-transparent';

const FIXED_ROW =
  'flex min-h-11 items-center rounded-xl bg-brand-soft px-3 text-sm font-medium text-ink-soft';

/** Workflow editor: fixed start and end, the steps between them renamed, reordered, added or removed. Saved as a whole. */
export const StatusesDialog = ({ modal }: { modal: string }) => {
  const { statuses, saveStatuses } = useContext();
  const [draft, setDraft] = useState<Status[]>(statuses);
  const [showErrors, setShowErrors] = useState(false);

  const names = draft.map((status) => status.name.trim().toLowerCase());
  const errorOf = (index: number): string | null =>
    names[index] === ''
      ? 'Podaj nazwę statusu.'
      : names.indexOf(names[index]!) !== index
        ? 'Status o takiej nazwie już istnieje.'
        : null;
  const invalid = draft.some((_, index) => errorOf(index) !== null);

  const move = (index: number, by: -1 | 1) =>
    setDraft((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item!);
      return next;
    });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (invalid) {
      setShowErrors(true);
      return;
    }
    saveStatuses(draft.map((s) => ({ ...s, name: s.name.trim() })));
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:statuses-dialog"
      title="Statusy zadań"
      description="Kolejność, w jakiej zadanie przechodzi po kliknięciu kółka. Pierwszy i ostatni status są stałe."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-2">
        <p className={FIXED_ROW}>{OPEN_NAME}</p>
        <ol aria-label="Statusy" className="flex flex-col gap-2">
          {draft.map((status, index) => {
            const error = showErrors ? errorOf(index) : null;
            return (
              <li key={status.id} className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <ClearableInput
                    type="text"
                    aria-label={`Nazwa statusu ${index + 1}`}
                    data-e2e={`time:status-name:${status.id}`}
                    value={status.name}
                    maxLength={NAME_MAX_LENGTH}
                    autoComplete="off"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                      error ? `status-error-${status.id}` : undefined
                    }
                    onChange={(e) =>
                      setDraft((list) =>
                        list.map((item) =>
                          item.id === status.id
                            ? { ...item, name: e.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                  <button
                    type="button"
                    aria-label={`Przesuń wyżej: ${status.name}`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className={ICON_BUTTON}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Przesuń niżej: ${status.name}`}
                    disabled={index === draft.length - 1}
                    onClick={() => move(index, 1)}
                    className={ICON_BUTTON}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Usuń status: ${status.name}`}
                    data-e2e={`time:status-delete:${status.id}`}
                    disabled={status.id === IN_PROGRESS}
                    onClick={() =>
                      setDraft((list) =>
                        list.filter((item) => item.id !== status.id),
                      )
                    }
                    className={ICON_BUTTON}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                {error ? (
                  <p
                    id={`status-error-${status.id}`}
                    role="alert"
                    className="text-sm text-danger"
                  >
                    {error}
                  </p>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className={FIXED_ROW}>{DONE_NAME}</p>
        <Button
          variant="ghost"
          data-e2e="time:status-add"
          disabled={draft.length >= MAX_STATUSES}
          onClick={() =>
            setDraft((list) => [...list, { id: newStatusId(), name: '' }])
          }
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj status
        </Button>
        <div className="mt-2 flex gap-2">
          <Button variant="ghost" onClick={() => closeModal(modal)}>
            Anuluj
          </Button>
          <Button type="submit" data-e2e="time:statuses-save">
            Zapisz
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
