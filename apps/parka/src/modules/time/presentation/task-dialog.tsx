import { useState, type FormEvent } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, Field, Input, Toggle } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import {
  DEFAULT_PRIORITY_ID,
  DEFAULT_TIME,
  NAME_MAX_LENGTH,
} from '../configuration/constraints';
import { newTaskId } from '../domain/ids';
import type { CategoryId, PriorityId, Task } from '../domain/models';
import { CategoryPicker } from './category-picker';
import { useContext } from './context';
import { deleteTaskModal } from './modal-ids';
import { ModalShell } from './modal-shell';
import { PriorityPicker } from './priority-picker';

type Props = {
  /** Its id in the URL modal stack. */
  modal: string;
  /** Task being edited; omitted when adding. */
  task?: Task;
  /** Day a new task starts on. */
  defaultDay: string;
};

/** Add / edit task popup; saving is optimistic (see the store handlers). */
export const TaskDialog = ({ modal, task, defaultDay }: Props) => {
  const {
    categories,
    priorities,
    newCategory,
    newPriority,
    createTask,
    updateTask,
  } = useContext();
  const editing = task !== undefined;
  const [title, setTitle] = useState(task?.title ?? '');
  const [pickedCategory, setCategoryId] = useState<CategoryId | undefined>(
    task?.categoryId,
  );
  const [pickedPriority, setPriorityId] = useState<PriorityId | undefined>(
    task?.priorityId,
  );
  // Defaults are derived, so they still apply when the lists arrive after
  // mount and when a picked item disappears (e.g. its creation failed).
  const categoryId = categories.some((item) => item.id === pickedCategory)
    ? pickedCategory
    : categories[0]?.id;
  const priorityId = priorities.some((item) => item.id === pickedPriority)
    ? pickedPriority
    : (priorities.find((item) => item.id === DEFAULT_PRIORITY_ID)?.id ??
      priorities[0]?.id);
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
  const [day, setDay] = useState(task?.day ?? defaultDay);
  const [allDay, setAllDay] = useState(editing && task.at === null);
  const [at, setAt] = useState(task?.at ?? DEFAULT_TIME);
  const [done, setDone] = useState(task?.done ?? false);
  const [touched, setTouched] = useState(false);

  const titleError = title.trim() === '' ? 'Podaj nazwę zadania.' : null;
  const dayError = day === '' ? 'Podaj dzień.' : null;
  const atError = !allDay && at === '' ? 'Podaj godzinę.' : null;
  const invalid =
    titleError !== null ||
    dayError !== null ||
    atError !== null ||
    categoryId === undefined ||
    priorityId === undefined;
  const pickError =
    categoryId === undefined
      ? 'Wybierz kategorię.'
      : priorityId === undefined
        ? 'Wybierz priorytet.'
        : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (invalid) return;
    const next: Task = {
      id: task?.id ?? newTaskId(),
      title: title.trim(),
      categoryId,
      priorityId,
      day,
      at: allDay ? null : at,
      done,
    };
    if (editing) updateTask(next);
    else createTask(next);
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:task-dialog"
      title={editing ? 'Edytuj zadanie' : 'Nowe zadanie'}
      description={
        editing ? 'Zmień szczegóły zadania.' : 'Wpisz nazwę, dzień i godzinę.'
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <Field label="Nazwa">
          <ClearableInput
            type="text"
            value={title}
            maxLength={NAME_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Kurs angielskiego"
            autoComplete="off"
            aria-invalid={touched && titleError !== null}
            aria-describedby={
              touched && titleError ? 'task-title-error' : undefined
            }
          />
          {touched && titleError ? (
            <span
              id="task-title-error"
              role="alert"
              className="mt-1 block text-xs text-danger"
            >
              {titleError}
            </span>
          ) : null}
        </Field>
        <CategoryPicker value={categoryId} onChange={setCategoryId} />
        <PriorityPicker value={priorityId} onChange={setPriorityId} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Dzień">
            <Input
              type="date"
              value={day}
              aria-invalid={touched && dayError !== null}
              onChange={(e) => setDay(e.target.value)}
            />
          </Field>
          <Field label="Godzina">
            <Input
              type="time"
              value={at}
              disabled={allDay}
              aria-invalid={touched && atError !== null}
              onChange={(e) => setAt(e.target.value)}
              className="disabled:opacity-50"
            />
          </Field>
        </div>
        {touched && pickError ? (
          <span role="alert" className="-mt-2 block text-xs text-danger">
            {pickError}
          </span>
        ) : null}
        {touched && (dayError ?? atError) ? (
          <span role="alert" className="-mt-2 block text-xs text-danger">
            {dayError ?? atError}
          </span>
        ) : null}
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium">Cały dzień</span>
          <Toggle label="Cały dzień" checked={allDay} onChange={setAllDay} />
        </div>
        {editing ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Zrobione</span>
            <Toggle label="Zrobione" checked={done} onChange={setDone} />
          </div>
        ) : null}
        <div className="mt-1 flex items-center gap-2">
          {editing ? (
            <Button
              variant="danger"
              data-e2e="time:task-delete"
              onClick={() => openModal(deleteTaskModal(task.id))}
              className="w-auto"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Usuń
            </Button>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button
              variant="ghost"
              onClick={() => closeModal(modal)}
              className="w-auto"
            >
              Anuluj
            </Button>
            <Button type="submit" data-e2e="time:task-save" className="w-auto">
              {editing ? 'Zapisz' : 'Dodaj'}
            </Button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
};
