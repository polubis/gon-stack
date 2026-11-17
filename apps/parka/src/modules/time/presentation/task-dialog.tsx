import { useEffect, useState, type FormEvent } from 'react';
import { Info, Repeat, Trash2 } from 'lucide-react';
import {
  currentDevice,
  loadDeviceHints,
} from '@/shared/device/integration/current-device';
import { dayLabel } from '@/shared/date/date';
import { isDay } from '@/shared/period/period';
import type { TaskRecurringInterval } from '@/shared/recurring/occurrences';
import { Button, Field, Input, Select, Toggle } from '@/shared/ui/controls';
import { ClearableInput } from '@/shared/ui/clearable';
import { RecurringScopeDialog } from '@/shared/ui/recurring-scope-dialog';
import { closeModal, openModal } from '@/shared/router/modal-stack';
import {
  DEFAULT_PRIORITY_ID,
  DEFAULT_TIME,
  INTERVALS,
  TASK_TITLE_MAX_LENGTH,
} from '../configuration/constraints';
import { newRecurringId, newTaskId } from '../domain/ids';
import type { CategoryId, PriorityId, Task } from '../domain/models';
import {
  IN_PROGRESS,
  stepName,
  stepOf,
  withStep,
  workflow,
  type Step,
} from '../domain/status';
import { CategoryPicker } from './category-picker';
import { useContext } from './context';
import { DescriptionField } from './description-field';
import { deleteTaskModal } from './modal-ids';
import { ModalShell } from './modal-shell';
import { PriorityPicker } from './priority-picker';
import { RecurringMark } from './recurring-mark';
import { TaskDeviceDetail } from './task-device';
import { ModalFooter } from '@/shared/ui/modal-footer';

type Props = {
  /** Its id in the URL modal stack. */
  modal: string;
  /** Task being edited; omitted when adding. */
  task?: Task;
  /** Day a new task starts on. */
  defaultDay: string;
  /** Opens with "Powtarzaj" already on. */
  startRepeating?: boolean;
};

const intervalPhrase = (interval: TaskRecurringInterval): string =>
  (INTERVALS.find((i) => i.value === interval)?.label ?? '').toLowerCase();

/** Add / edit task popup; saving is optimistic (see the store handlers). */
export const TaskDialog = ({
  modal,
  task,
  defaultDay,
  startRepeating = false,
}: Props) => {
  const {
    categories,
    priorities,
    newCategory,
    newPriority,
    createTask,
    statuses,
    updateTask,
    createRecurring,
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
  const [description, setDescription] = useState(task?.description ?? '');
  const [day, setDay] = useState(task?.day ?? defaultDay);
  const [allDay, setAllDay] = useState(!editing || task.at === null);
  const [at, setAt] = useState(task?.at ?? DEFAULT_TIME);
  const [pickedStep, setStep] = useState<Step>(task ? stepOf(task) : 'open');
  const steps = workflow(statuses);
  // A step removed while the form is open reads as the built-in one.
  const step = steps.includes(pickedStep) ? pickedStep : IN_PROGRESS;
  const [repeat, setRepeat] = useState(startRepeating);
  const [interval, setInterval] = useState<TaskRecurringInterval>('weekly');
  const [endDate, setEndDate] = useState('');
  const [touched, setTouched] = useState(false);
  // A recurring task waits here while the user picks how far the edit reaches.
  const [pending, setPending] = useState<Task | null>(null);

  // The model code is async; have it by the time the user submits.
  useEffect(() => {
    void loadDeviceHints();
  }, []);

  const titleError = title.trim() === '' ? 'Podaj nazwę zadania.' : null;
  const dayError = day === '' ? 'Podaj dzień.' : null;
  const atError = !allDay && at === '' ? 'Podaj godzinę.' : null;
  const endError =
    repeat && endDate !== '' && endDate < day
      ? 'Koniec nie może być przed pierwszym dniem.'
      : null;
  const invalid =
    titleError !== null ||
    endError !== null ||
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
    if (repeat && !editing) {
      createRecurring({
        id: newRecurringId(),
        title: title.trim(),
        description: description.trim() || null,
        categoryId,
        priorityId,
        at: allDay ? null : at,
        interval,
        startDate: day,
        endDate: endDate || null,
      });
      closeModal(modal);
      return;
    }
    const next: Task = {
      id: task?.id ?? newTaskId(),
      key: task?.key ?? null,
      title: title.trim(),
      description: description.trim() || null,
      categoryId,
      priorityId,
      day,
      at: allDay ? null : at,
      done: false,
      inProgress: false,
      statusId: null,
      device: task?.device ?? currentDevice(),
      recurringId: task?.recurringId ?? null,
    };
    if (editing && next.recurringId !== null) {
      // The edit waits while the user picks how far it reaches.
      setPending(withStep(next, step));
      return;
    }
    if (editing) updateTask(withStep(next, step));
    else createTask(next);
    closeModal(modal);
  };

  return (
    <>
      <ModalShell
        modal={modal}
        data-e2e="time:task-dialog"
        title={editing ? 'Edytuj zadanie' : 'Nowe zadanie'}
        description={
          editing ? 'Zmień szczegóły zadania.' : 'Wpisz nazwę, dzień i godzinę.'
        }
      >
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <Field label="Nazwa" required>
            <ClearableInput
              type="text"
              data-e2e="time:task-name"
              value={title}
              maxLength={TASK_TITLE_MAX_LENGTH}
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
          <DescriptionField value={description} onChange={setDescription} />
          <CategoryPicker value={categoryId} onChange={setCategoryId} />
          <PriorityPicker value={priorityId} onChange={setPriorityId} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Dzień" required>
              <Input
                type="date"
                value={day}
                aria-invalid={touched && dayError !== null}
                onChange={(e) => setDay(e.target.value)}
              />
            </Field>
            <Field label="Godzina" required={!allDay}>
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
          {isDay(day) ? (
            <p className="-mt-3 text-xs text-ink-soft">
              {dayLabel(day, 'long')}
            </p>
          ) : null}
          {touched && pickError ? (
            <span role="alert" className="-mt-3 block text-xs text-danger">
              {pickError}
            </span>
          ) : null}
          {touched && (dayError ?? atError) ? (
            <span role="alert" className="-mt-3 block text-xs text-danger">
              {dayError ?? atError}
            </span>
          ) : null}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">Cały dzień</span>
            <Toggle label="Cały dzień" checked={allDay} onChange={setAllDay} />
          </div>
          {!editing ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <Repeat className="h-4 w-4" aria-hidden="true" />
                  Powtarzaj
                </span>
                <Toggle
                  label="Powtarzaj"
                  data-e2e="time:recurring-toggle"
                  checked={repeat}
                  onChange={setRepeat}
                />
              </div>
              {repeat ? (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Częstotliwość">
                    <Select
                      value={interval}
                      data-e2e="time:recurring-interval"
                      options={INTERVALS}
                      onValueChange={(value) =>
                        setInterval(value as TaskRecurringInterval)
                      }
                    />
                  </Field>
                  <Field label="Koniec (opcjonalnie)">
                    <Input
                      type="date"
                      value={endDate}
                      min={day}
                      data-e2e="time:recurring-end"
                      aria-invalid={touched && endError !== null}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </Field>
                </div>
              ) : null}
              {touched && endError ? (
                <span role="alert" className="-mt-3 block text-xs text-danger">
                  {endError}
                </span>
              ) : null}
              {repeat && endDate !== '' && endError === null ? (
                <span
                  role="status"
                  data-e2e="time:recurring-end-notice"
                  className="-mt-3 flex items-start gap-1.5 text-xs text-muted"
                >
                  <Info
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {`Zadanie dodamy ${intervalPhrase(interval)} od ${day} do ${endDate} włącznie.`}
                </span>
              ) : null}
            </>
          ) : null}
          {editing && task.recurringId !== null ? (
            <RecurringMark labelled />
          ) : null}
          {editing && task.device ? (
            <TaskDeviceDetail device={task.device} />
          ) : null}
          {editing ? (
            <Field label="Status">
              <Select
                data-e2e="time:task-status"
                value={step}
                options={steps.map((value) => ({
                  value,
                  label: stepName(value, statuses),
                }))}
                onValueChange={(value) => setStep(value as Step)}
              />
            </Field>
          ) : null}
          <ModalFooter className="flex items-center gap-2">
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
                data-e2e="time:task-cancel"
                onClick={() => closeModal(modal)}
                className="w-auto"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                data-e2e="time:task-save"
                className="w-auto"
              >
                {editing ? 'Zapisz' : 'Dodaj'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </ModalShell>
      {pending ? (
        <RecurringScopeDialog
          action="edit"
          title="Zapisać zmiany w zadaniu?"
          subject={`Zadanie „${pending.title}” jest cykliczne. Wybierz, które zadania tej serii objąć zmianą. Samo tworzenie kolejnych zadań się nie zmienia.`}
          confirmLabel="Zapisz zmiany"
          onClose={() => setPending(null)}
          onConfirm={(scope) => {
            updateTask(pending, undefined, scope);
            setPending(null);
            closeModal(modal);
          }}
        />
      ) : null}
    </>
  );
};
