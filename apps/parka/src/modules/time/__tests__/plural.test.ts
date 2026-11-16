import { describe, expect, it } from 'vitest';
import { pluralTasks } from '../domain/plural';

describe('task count label', () => {
  it.each([
    [0, '0 zadań'],
    [1, '1 zadanie'],
    [2, '2 zadania'],
    [4, '4 zadania'],
    [5, '5 zadań'],
    [12, '12 zadań'],
    [22, '22 zadania'],
    [25, '25 zadań'],
  ])('writes %i as "%s"', (count, label) => {
    expect(pluralTasks(count)).toBe(label);
  });
});
