import { useLayoutEffect, useRef, useState } from 'react';
import { closeModalThen, openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { DESCRIPTION_CLAMP_LINES } from '../configuration/constraints';
import type { BacklogTask, Task } from '../domain/models';
import { PriorityBadge } from './priority-badge';
import { useContext } from './context';
import { descriptionModal, editBacklogModal, editTaskModal } from './modal-ids';
import { ModalShell } from './modal-shell';

/** Roughly what fits the clamp when layout can't be measured. */
const LONG_TEXT = 180;

const isLong = (text: string): boolean =>
  text.length > LONG_TEXT || text.split('\n').length > DESCRIPTION_CLAMP_LINES;

/** The description cut to a few lines; "show more" opens all of it. */
const ClampedDescription = ({ task }: { task: Task | BacklogTask }) => {
  const text = task.description ?? '';
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflows, setOverflows] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setOverflows(el.scrollHeight > el.clientHeight);
  }, [text]);
  return (
    <section aria-label="Opis" className="flex flex-col items-start gap-1">
      <p
        ref={ref}
        data-e2e="time:description-clamp"
        className="line-clamp-3 whitespace-pre-wrap break-words text-sm"
      >
        {text}
      </p>
      {overflows || isLong(text) ? (
        <button
          type="button"
          data-e2e="time:description-more"
          aria-label={`Pokaż cały opis: ${task.title}`}
          onClick={() => openModal(descriptionModal(task.id))}
          className="rounded-md text-xs font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Pokaż więcej
        </button>
      ) : null}
    </section>
  );
};

const isBoardTask = (task: Task | BacklogTask): task is Task => 'day' in task;

/** Read-only view of a task: what it is, when, and its description clamped to a few lines. */
export const TaskDetails = ({
  modal,
  task,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  task: Task | BacklogTask;
}) => {
  const { categories, priorities } = useContext();
  const category = categories.find((item) => item.id === task.categoryId);
  const priority = priorities.find((item) => item.id === task.priorityId);
  const edit = () =>
    closeModalThen(modal, () =>
      openModal(
        isBoardTask(task) ? editTaskModal(task.id) : editBacklogModal(task.id),
      ),
    );
  return (
    <ModalShell
      modal={modal}
      data-e2e="time:task-details"
      title="Szczegóły zadania"
      description={
        isBoardTask(task)
          ? `${task.day}${task.at === null ? '' : `, ${task.at}`}`
          : 'Zadanie z backlogu'
      }
    >
      <div className="flex flex-col gap-3">
        <h3 className="break-words text-base font-semibold">{task.title}</h3>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
          {category ? (
            <span className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              {category.name}
            </span>
          ) : null}
          {priority ? <PriorityBadge priority={priority} /> : null}
          {isBoardTask(task) && task.done ? <span>Zrobione</span> : null}
          {isBoardTask(task) && task.inProgress ? <span>W trakcie</span> : null}
        </p>
        {task.description ? <ClampedDescription task={task} /> : null}
        <div className="mt-1 flex justify-end">
          <Button
            data-e2e="time:task-details-edit"
            onClick={edit}
            className="w-auto"
          >
            Edytuj
          </Button>
        </div>
      </div>
    </ModalShell>
  );
};

/** Whole description of a task in a scrollable popup. */
export const TaskDescription = ({
  modal,
  task,
}: {
  modal: string;
  task: Task | BacklogTask;
}) => (
  <ModalShell
    modal={modal}
    data-e2e="time:description-full"
    title="Opis zadania"
    description={task.title}
  >
    <div
      tabIndex={0}
      role="region"
      aria-label="Pełny opis"
      className="max-h-[60dvh] overflow-y-auto whitespace-pre-wrap break-words rounded-md pr-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {task.description}
    </div>
  </ModalShell>
);
