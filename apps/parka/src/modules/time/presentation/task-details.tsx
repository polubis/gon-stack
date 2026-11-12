import { dayLabel } from '@/shared/date/date';
import { closeModalThen, openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import type { BacklogTask, Task } from '../domain/models';
import { stepName, stepOf } from '../domain/status';
import { PriorityBadge } from './priority-badge';
import { useContext } from './context';
import { editBacklogModal, editTaskModal } from './modal-ids';
import { ModalShell } from './modal-shell';
import { TaskAttachments } from './task-attachments';
import { TaskComments } from './task-comments';
import { TaskHistory } from './task-history';
import { TaskKey } from './task-key';

const isBoardTask = (task: Task | BacklogTask): task is Task => 'day' in task;

/** Read-only view of a task: every detail, the whole description included. */
export const TaskDetails = ({
  modal,
  task,
}: {
  /** Its id in the URL modal stack. */
  modal: string;
  task: Task | BacklogTask;
}) => {
  const { categories, priorities, statuses } = useContext();
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
          ? `${dayLabel(task.day, 'long')}${task.at === null ? '' : `, ${task.at}`}`
          : 'Zadanie z backlogu'
      }
    >
      <div className="flex flex-col gap-3">
        <TaskKey taskKey={task.key} data-e2e="time:task-details-key" />
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
          {isBoardTask(task) && task.inProgress ? (
            <span>{stepName(stepOf(task), statuses)}</span>
          ) : null}
        </p>
        {task.description ? (
          <section aria-label="Opis">
            <p
              data-e2e="time:description-full"
              className="whitespace-pre-wrap break-words text-sm"
            >
              {task.description}
            </p>
          </section>
        ) : null}
        <TaskAttachments taskId={task.id} />
        <TaskComments taskId={task.id} />
        <TaskHistory taskId={task.id} />
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
