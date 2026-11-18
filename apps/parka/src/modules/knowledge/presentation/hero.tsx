import { useState } from 'react';
import { BRAIN_AREAS, type BrainAreaId } from '../domain/brain-area';
import { areaFills, cortexSplit, fillOf } from '../domain/learning';
import { BrainFill } from './brain-fill';
import { useContext } from './context';

/** Summary card on the obsidian hero: the brain filling up with knowledge. */
export const Hero = () => {
  const { categories, catalogs, allTopics, summary } = useContext();
  const [area, setArea] = useState<BrainAreaId | null>(null);
  const split = cortexSplit(categories, catalogs, allTopics);
  const fills = areaFills(categories, catalogs, allTopics);
  const total = fillOf(allTopics);
  const progress = Math.round(total * 100);
  const untouched = summary.topics - summary.startedTopics - summary.doneTopics;
  const picked = BRAIN_AREAS.find((a) => a.id === area);
  const pickedFill = fills.find((f) => f.id === area)?.fill ?? 0;
  return (
    <div
      data-e2e="knowledge:hero"
      className="hero-card flex flex-col gap-4 rounded-4xl p-5 shadow-popover md:p-7 xl:h-full xl:justify-between"
    >
      <div className="flex flex-col gap-1">
        <p className="text-sm text-on-hero-soft">Wypełnienie mózgu wiedzą</p>
        <p
          data-e2e="knowledge:progress"
          className="animate-rise text-5xl font-semibold tracking-tight tabular-nums motion-reduce:animate-none md:text-6xl"
        >
          {progress}%
        </p>
      </div>
      <BrainFill
        data-e2e="knowledge:brain"
        areas={fills}
        total={total}
        highlighted={area}
        onSelectArea={(id) =>
          setArea((current) => (current === id ? null : id))
        }
        className="mx-auto w-full max-w-sm"
      />
      {picked ? (
        <p
          role="status"
          data-e2e="knowledge:area"
          className="text-center text-xs text-on-hero-soft"
        >
          {picked.name}: {Math.round(pickedFill * 100)}% · {picked.role}
        </p>
      ) : null}
      <dl className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
        {(
          [
            ['Nieruszone', untouched],
            ['Rozpoczęte', summary.startedTopics],
            ['Ukończone', summary.doneTopics],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="flex flex-col items-center gap-0.5 px-2">
            <dt className="text-center text-xs text-on-hero-soft">{label}</dt>
            <dd className="text-sm font-semibold tabular-nums md:text-base">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p
        data-e2e="knowledge:touched"
        className="text-center text-xs text-on-hero-soft"
      >
        Ruszone {summary.startedTopics + summary.doneTopics} z {summary.topics}{' '}
        tematów · Rolki {summary.doneReels}/{summary.reels}
      </p>
      <p
        data-e2e="knowledge:cortex"
        className="text-center text-xs text-on-hero-soft"
      >
        Kora mózgowa {Math.round(split.cortex * 100)}% · Móżdżek i pień{' '}
        {Math.round(split.rest * 100)}%
      </p>
    </div>
  );
};
