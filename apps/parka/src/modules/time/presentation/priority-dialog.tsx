import { Trash2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { cn } from '@repo/react-kit/cn';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { NAME_MAX_LENGTH, PRIORITY_VALUES } from '../configuration/constraints';
import type { Priority } from '../domain/models';
import { useContext } from './context';
import { deletePriorityModal } from './modal-ids';
import { PriorityBadge } from './priority-badge';
import { ModalShell } from './modal-shell';
import { ModalFooter } from '@/shared/ui/modal-footer';

/** Priority form (new, or `priority` being edited): a name and a value from 1 to 10. */
export const PriorityDialog = ({
  modal,
  priority,
}: {
  modal: string;
  priority?: Priority;
}) => {
  const { priorities, createPriority, updatePriority } = useContext();
  const [name, setName] = useState(priority?.name ?? '');
  const [value, setValue] = useState(priority?.value ?? 5);
  const [showErrors, setShowErrors] = useState(false);

  const trimmed = name.trim();
  const nameError = !trimmed
    ? 'Podaj nazwę priorytetu.'
    : priorities.some((p) => p.id !== priority?.id && p.name === trimmed)
      ? 'Priorytet o takiej nazwie już istnieje.'
      : null;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (nameError) {
      setShowErrors(true);
      return;
    }
    if (priority) updatePriority({ ...priority, name: trimmed, value });
    else createPriority({ name: trimmed, value });
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:priority-dialog"
      title={priority ? 'Edytuj priorytet' : 'Nowy priorytet'}
      description="Nazwa i ważność od 1 do 10: 8-10 wysoki, 4-7 średni, 1-3 niski."
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        <Field label="Nazwa" required>
          <ClearableInput
            type="text"
            value={name}
            maxLength={NAME_MAX_LENGTH}
            placeholder="np. Pilny"
            autoComplete="off"
            aria-invalid={showErrors && nameError ? true : undefined}
            aria-describedby={
              showErrors && nameError ? 'time-priority-name-error' : undefined
            }
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        {showErrors && nameError ? (
          <p
            id="time-priority-name-error"
            role="alert"
            className="-mt-3 text-sm text-danger"
          >
            {nameError}
          </p>
        ) : null}

        <fieldset className="min-w-0">
          <legend className="mb-1 text-sm font-medium text-ink-soft">
            Ważność (1 = najmniej, 10 = najbardziej)
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {PRIORITY_VALUES.map((n) => (
              <label
                key={n}
                className={cn(
                  'grid h-11 cursor-pointer place-items-center rounded-xl border text-sm font-semibold tabular-nums transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                  n === value
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-line-strong text-ink-soft hover:bg-hover-soft',
                )}
              >
                <input
                  type="radio"
                  name="priority-value"
                  value={n}
                  checked={n === value}
                  onChange={() => setValue(n)}
                  className="sr-only"
                />
                {n}
              </label>
            ))}
          </div>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            Tak będzie wyglądać:
            <PriorityBadge priority={{ name: trimmed || 'Priorytet', value }} />
          </p>
        </fieldset>

        {priority ? (
          <div className="border-t border-line pt-5">
            <Button
              variant="danger"
              data-e2e="time:priority-delete"
              onClick={() => openModal(deletePriorityModal(priority.id))}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Usuń
            </Button>
          </div>
        ) : null}

        <ModalFooter className="flex gap-2">
          <Button variant="ghost" onClick={() => closeModal(modal)}>
            Anuluj
          </Button>
          <Button type="submit" data-e2e="time:priority-save">
            {priority ? 'Zapisz zmiany' : 'Dodaj priorytet'}
          </Button>
        </ModalFooter>
      </form>
    </ModalShell>
  );
};
