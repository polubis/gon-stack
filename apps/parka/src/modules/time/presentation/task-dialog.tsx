import { useState, type FormEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button, Field, Input, Toggle } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { closeModal, useModalMounted } from '@/shared/router/modal-stack';
import {
  ALL_TASKS,
  DEFAULT_PRIORITY,
  type Task,
} from '../configuration/constraints';
import { CategoryPicker } from './category-picker';
import { PriorityPicker } from './priority-picker';
import { useContext } from './lists-context';

type Props = {
  /** Its id in the URL modal stack. */
  modal: string;
  /** Task being edited; omitted when adding. */
  task?: Task;
};

const DEFAULT_TIME = '12:00';
const TODAY = '2026-10-20';

/** Look a task up by title among the dummy tasks. */
export const findTask = (title: string): Task | undefined =>
  ALL_TASKS.find((task) => task.title === title);

/**
 * Add / edit task popup. Presentation only: the form keeps local state and
 * saving just closes it (no store or backend exists yet).
 */
export const TaskDialog = ({ modal, task }: Props) => {
  const { categories, newCategory, newPriority } = useContext();
  useModalMounted(modal);
  const editing = task !== undefined;
  const [title, setTitle] = useState(task?.title ?? '');
  const [categoryId, setCategoryId] = useState(
    categories.find((item) => item.id === task?.tone)?.id ?? categories[0]?.id,
  );
  const [priorityId, setPriorityId] = useState(
    task?.priority ?? DEFAULT_PRIORITY,
  );
  // Select what was just created in the stacked form (adjusted while rendering).
  const [seenCategory, setSeenCategory] = useState(newCategory);
  if (newCategory !== seenCategory) {
    setSeenCategory(newCategory);
    if (newCategory) setCategoryId(newCategory.id);
  }
  const [seenPriority, setSeenPriority] = useState(newPriority);
  if (newPriority !== seenPriority) {
    setSeenPriority(newPriority);
    if (newPriority) setPriorityId(newPriority.id);
  }
  const [date, setDate] = useState(TODAY);
  const [allDay, setAllDay] = useState(task?.slot.kind === 'allDay');
  const [at, setAt] = useState(
    task?.slot.kind === 'timed' ? task.slot.at : DEFAULT_TIME,
  );
  const [done, setDone] = useState(task?.done ?? false);
  const [touched, setTouched] = useState(false);

  const invalid = title.trim() === '';
  const close = () => closeModal(modal);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!invalid) close();
  };

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-modal) bg-overlay" />
        <Dialog.Content
          data-e2e="time:task-dialog"
          className="fixed inset-x-4 bottom-4 z-(--z-modal) mx-auto max-h-[calc(100dvh-2rem)] max-w-md animate-pop-in overflow-y-auto rounded-2xl bg-card p-4 focus:outline-none motion-reduce:animate-none lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2"
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <Dialog.Title className="truncate text-base font-semibold">
                {editing ? 'Edytuj zadanie' : 'Nowe zadanie'}
              </Dialog.Title>
              <Dialog.Description className="mt-0.5 text-xs text-ink-soft">
                {editing
                  ? 'Zmień szczegóły zadania.'
                  : 'Wpisz nazwę, dzień i godzinę.'}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Zamknij"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <form onSubmit={submit} noValidate className="flex flex-col gap-3">
            <Field label="Nazwa">
              <ClearableInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="np. Kurs angielskiego"
                autoComplete="off"
                aria-invalid={touched && invalid}
                aria-describedby={
                  touched && invalid ? 'task-title-error' : undefined
                }
              />
              {touched && invalid ? (
                <span
                  id="task-title-error"
                  role="alert"
                  className="mt-1 block text-xs text-danger"
                >
                  Podaj nazwę zadania.
                </span>
              ) : null}
            </Field>
            <CategoryPicker value={categoryId} onChange={setCategoryId} />
            <PriorityPicker value={priorityId} onChange={setPriorityId} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dzień">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </Field>
              <Field label="Godzina">
                <Input
                  type="time"
                  value={at}
                  disabled={allDay}
                  onChange={(e) => setAt(e.target.value)}
                  className="disabled:opacity-50"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">Cały dzień</span>
              <Toggle
                label="Cały dzień"
                checked={allDay}
                onChange={setAllDay}
              />
            </div>
            {editing ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">Zrobione</span>
                <Toggle label="Zrobione" checked={done} onChange={setDone} />
              </div>
            ) : null}
            <div className="mt-1 flex items-center gap-2">
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" onClick={close} className="w-auto">
                  Anuluj
                </Button>
                <Button type="submit" className="w-auto">
                  {editing ? 'Zapisz' : 'Dodaj'}
                </Button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
