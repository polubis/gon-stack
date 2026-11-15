import { cn } from '@repo/react-kit/cn';
import { BRAIN_AREAS } from '../domain/brain-area';
import { areaFills, knowledgeStats } from '../domain/learning';
import { BrainFill } from './brain-fill';
import { useContext } from './context';

/** Summary card on the obsidian hero: the brain filling up with knowledge. */
export const Hero = () => {
  const { folders, nodes, categories, priorities, area, hovered, toggleArea } =
    useContext();
  const stats = knowledgeStats(nodes, categories, priorities);
  const fills = areaFills(folders, nodes);
  const lit = hovered ?? area;
  // Same number the brain announces: the mean of its six areas.
  const progress = Math.round(
    (fills.reduce((sum, a) => sum + a.fill, 0) / fills.length) * 100,
  );
  const best = [...fills].sort((a, b) => b.fill - a.fill)[0];
  const bestName = BRAIN_AREAS.find((a) => a.id === best?.id)?.name;
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
        highlighted={lit}
        onSelectArea={toggleArea}
        className="mx-auto w-full max-w-sm"
      />
      <dl className="grid grid-cols-3 divide-x divide-hero-line border-t border-hero-line pt-4">
        {(
          [
            ['Opanowane', stats.byStatus.learned],
            ['W nauce', stats.byStatus.learning],
            ['Do nauki', stats.byStatus['to-learn']],
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
      {best && best.fill > 0 ? (
        <p className={cn('text-center text-xs text-on-hero-soft')}>
          Najpełniejszy obszar: {bestName}
        </p>
      ) : null}
    </div>
  );
};
