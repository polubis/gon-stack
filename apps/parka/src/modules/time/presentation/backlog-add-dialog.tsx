import { useEffect, useState, type FormEvent } from 'react';
import {
  currentDevice,
  loadDeviceHints,
} from '@/shared/device/integration/current-device';
import { Button, Field } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { closeModal } from '@/shared/router/modal-stack';
import {
  DEFAULT_PRIORITY_ID,
  TASK_TITLE_MAX_LENGTH,
} from '../configuration/constraints';
import { newTaskId } from '../domain/ids';
import type { BacklogTask, CategoryId, PriorityId } from '../domain/models';
import { CategoryPicker } from './category-picker';
import { useContext } from './context';
import { DescriptionField } from './description-field';
import { ModalShell } from './modal-shell';
import { PriorityPicker } from './priority-picker';

/** Adds (or edits) a task without a day; saving is optimistic. */
export const BacklogAddDialog = ({
  modal,
  task,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  /** Backlog task being edited; omitted when adding. */
  task?: BacklogTask;
}) => {
  const {
    categories,
    priorities,
    newCategory,
    newPriority,
    createBacklogTask,
    updateBacklogTask,
  } = useContext();
  const editing = task !== undefined;
  const [title, setTitle] = useState(task?.title ?? '');
  const [pickedCategory, setCategoryId] = useState<CategoryId | undefined>(
    task?.categoryId,
  );
  const [pickedPriority, setPriorityId] = useState<PriorityId | undefined>(
    task?.priorityId,
  );
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
  const [description, setDescription] = useState(task?.description ?? '');
  const [touched, setTouched] = useState(false);

  // The model code is async; have it by the time the user submits.
  useEffect(() => {
    void loadDeviceHints();
  }, []);

  const titleError = title.trim() === '' ? 'Podaj nazwę zadania.' : null;
  const pickError =
    categoryId === undefined
      ? 'Wybierz kategorię.'
      : priorityId === undefined
        ? 'Wybierz priorytet.'
        : null;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (titleError !== null || categoryId === undefined) return;
    if (priorityId === undefined) return;
    const next: BacklogTask = {
      id: task?.id ?? newTaskId(),
      title: title.trim(),
      description: description.trim() || null,
      categoryId,
      priorityId,
      device: task?.device ?? currentDevice(),
    };
    if (editing) updateBacklogTask(next);
    else createBacklogTask(next);
    closeModal(modal);
  };

  return (
    <ModalShell
      modal={modal}
      data-e2e="time:backlog-form"
      title={editing ? 'Edytuj zadanie z backlogu' : 'Do backlogu'}
      description={
        editing
          ? 'Zmień szczegóły. Zadanie zostaje w backlogu.'
          : 'Zadanie bez terminu. Dzień wybierzesz później.'
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <Field label="Nazwa">
          <ClearableInput
            type="text"
            value={title}
            maxLength={TASK_TITLE_MAX_LENGTH}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="np. Umówić wizytę u dentysty"
            autoComplete="off"
            aria-invalid={touched && titleError !== null}
            aria-describedby={
              touched && titleError ? 'backlog-title-error' : undefined
            }
          />
          {touched && titleError ? (
            <span
              id="backlog-title-error"
              role="alert"
              className="mt-1 block text-xs text-danger"
            >
              {titleError}
            </span>
          ) : null}
        </Field>
        <DescriptionField value={description} onChange={setDescription} />
        <CategoryPicker value={categoryId} onChange={setCategoryId} />
        <PriorityPicker value={priorityId} onChange={setPriorityId} />
        {touched && pickError ? (
          <span role="alert" className="-mt-2 block text-xs text-danger">
            {pickError}
          </span>
        ) : null}
        <div className="mt-1 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => closeModal(modal)}
            className="w-auto"
          >
            Anuluj
          </Button>
          <Button type="submit" data-e2e="time:backlog-save" className="w-auto">
            {editing ? 'Zapisz' : 'Dodaj'}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
};
