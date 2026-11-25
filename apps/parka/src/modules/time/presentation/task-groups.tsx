import type { ReactNode } from 'react';
import type { ChangePhase } from '@/shared/ui/list-changes';
import { groupByCategory } from '../domain/group';
import type { BacklogTask, Task } from '../domain/models';
import { useContext } from './context';
import { TaskRow } from './task-row';

export type TaskGroupRow = {
  key: string;
  item: Task | BacklogTask;
  phase: ChangePhase;
};

type Props = {
  rows: readonly TaskGroupRow[];
  /** Id of the task of the current time. */
  nowId?: string;
  /** First entrance step; `undefined` leaves the entrance to a parent. */
  firstStep?: number;
  'data-e2e': `time:task-list:${string}`;
};

/** Flat task list split per category: a heading, then flush rows. */
export const TaskGroups = ({
  rows,
  nowId,
  firstStep,
  'data-e2e': dataE2e,
}: Props): ReactNode => {
  const { categories } = useContext();
  let step = firstStep;
  return (
    <ul data-e2e={dataE2e}>
      {groupByCategory(rows, categories).map(({ category, rows: group }) => (
        <li key={category?.id ?? 'none'} className="list-none">
          <section
            aria-label={category?.name ?? 'Bez kategorii'}
            data-e2e={`time:task-group:${category?.id ?? 'none'}`}
          >
            <h3 className="flex items-center gap-2 pt-3 pb-1 text-xs font-semibold tracking-wide text-ink-soft uppercase">
              {category ? (
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
              ) : null}
              <span className="truncate">
                {category?.name ?? 'Bez kategorii'}
              </span>
            </h3>
            <ul>
              {group.map(({ key, item, phase }) => (
                <TaskRow
                  key={key}
                  flat
                  task={item}
                  phase={phase}
                  now={item.id === nowId}
                  step={step === undefined ? undefined : step++}
                />
              ))}
            </ul>
          </section>
        </li>
      ))}
    </ul>
  );
};
