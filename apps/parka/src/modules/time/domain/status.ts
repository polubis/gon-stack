import type { Status, StatusId, Task } from './models';

/** What nothing was configured gives: the one step that always exists. */
export const IN_PROGRESS = 'in_progress' as StatusId;

export const DEFAULT_STATUSES: Status[] = [
  { id: IN_PROGRESS, name: 'W trakcie' },
];

export const OPEN_NAME = 'Do zrobienia';
export const DONE_NAME = 'Zrobione';

/** Where a task stands: `open`, `done` or the id of a step (`in_progress` for the built-in one). */
export type Step = 'open' | 'done' | StatusId;

export const stepOf = (task: Task): Step =>
  task.done
    ? 'done'
    : task.inProgress
      ? (task.statusId ?? IN_PROGRESS)
      : 'open';

/** The task standing on `step`; an unknown step is read as the built-in one. */
export const withStep = (task: Task, step: Step): Task => ({
  ...task,
  done: step === 'done',
  inProgress: step !== 'open' && step !== 'done',
  statusId:
    step === 'open' || step === 'done' || step === IN_PROGRESS ? null : step,
});

/** Open, the user's steps in order, done. */
export const workflow = (statuses: Status[]): Step[] => [
  'open',
  ...statuses.map((status) => status.id),
  'done',
];

/** The step a click moves to; the last one starts over. A removed step is read as the first started one. */
export const nextStep = (task: Task, statuses: Status[]): Step => {
  const steps = workflow(statuses);
  const at = steps.indexOf(stepOf(task));
  return steps[(at + 1) % steps.length] ?? 'open';
};

export const stepName = (step: Step, statuses: Status[]): string =>
  step === 'open'
    ? OPEN_NAME
    : step === 'done'
      ? DONE_NAME
      : (statuses.find((status) => status.id === step)?.name ??
        DEFAULT_STATUSES[0]!.name);
