import { describe, expect, it } from 'vitest';
import type { Status, StatusId, Task } from '../domain/models';
import {
  DEFAULT_STATUSES,
  IN_PROGRESS,
  nextStep,
  stepName,
  stepOf,
  withStep,
} from '../domain/status';

const REVIEW = { id: 'review' as StatusId, name: 'Review' };
const STATUSES: Status[] = [...DEFAULT_STATUSES, REVIEW];

const task = (patch: Partial<Task> = {}): Task =>
  ({ done: false, inProgress: false, statusId: null, ...patch }) as Task;

describe('status workflow', () => {
  it('keeps open, in progress and done when nothing is configured', () => {
    const path = [task()];
    for (let i = 0; i < 3; i++)
      path.push(withStep(path[i]!, nextStep(path[i]!, DEFAULT_STATUSES)));

    expect(path.map(stepOf)).toEqual(['open', 'in_progress', 'done', 'open']);
  });

  it('walks through a custom step placed between the built-in ones', () => {
    const path = [task()];
    for (let i = 0; i < 4; i++)
      path.push(withStep(path[i]!, nextStep(path[i]!, STATUSES)));

    expect(path.map(stepOf)).toEqual([
      'open',
      'in_progress',
      'review',
      'done',
      'open',
    ]);
  });

  it('follows the order the user chose', () => {
    const reordered = [REVIEW, ...DEFAULT_STATUSES];

    expect(stepOf(withStep(task(), nextStep(task(), reordered)))).toBe(
      'review',
    );
  });

  it('marks a started task, with or without a custom step', () => {
    expect(withStep(task(), REVIEW.id)).toMatchObject({
      done: false,
      inProgress: true,
      statusId: 'review',
    });
    expect(withStep(task({ statusId: REVIEW.id }), IN_PROGRESS)).toMatchObject({
      inProgress: true,
      statusId: null,
    });
  });

  it('clears the custom step when the task is open or done', () => {
    const started = task({ inProgress: true, statusId: REVIEW.id });

    expect(withStep(started, 'done')).toMatchObject({
      done: true,
      inProgress: false,
      statusId: null,
    });
    expect(withStep(started, 'open')).toMatchObject({
      done: false,
      inProgress: false,
      statusId: null,
    });
  });

  it('reads a removed step as the first started one', () => {
    const orphan = task({ inProgress: true, statusId: 'gone' as StatusId });

    expect(nextStep(orphan, DEFAULT_STATUSES)).toBe('open');
    expect(stepName(stepOf(orphan), DEFAULT_STATUSES)).toBe('W trakcie');
  });

  it('names every step as the user sees it', () => {
    expect(stepName('open', STATUSES)).toBe('Do zrobienia');
    expect(stepName(REVIEW.id, STATUSES)).toBe('Review');
    expect(stepName('done', STATUSES)).toBe('Zrobione');
  });
});
