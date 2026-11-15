import { Donut } from '@/shared/ui/charts';
import { ProgressBar } from '@/shared/ui/controls';
import { Card } from '@/shared/ui/layout';
import {
  knowledgeStats,
  STATUS_NAMES,
  type PriorityLevel,
} from '../domain/learning';
import { useContext } from './context';

const PRIORITY_NAMES: Record<PriorityLevel, string> = {
  high: 'Wysoki',
  medium: 'Średni',
  low: 'Niski',
};

const PRIORITY_TONE: Record<PriorityLevel, 'danger' | 'warn' | 'brand'> = {
  high: 'danger',
  medium: 'warn',
  low: 'brand',
};

const TITLE = 'flex min-h-9 items-center text-base font-semibold';

/** Statistics cards: status, categories, learning priorities, popular tags. */
export const Stats = () => {
  const { nodes, categories, priorities } = useContext();
  const stats = knowledgeStats(nodes, categories, priorities);
  if (stats.total === 0) return null;
  return (
    <>
      <Card
        data-e2e="knowledge:stats"
        className="space-y-4 xl:col-span-6 xl:col-start-1"
      >
        <h2 className={TITLE}>Postęp nauki</h2>
        <Donut
          caption="Podział węzłów wg postępu"
          format={(value) => String(value)}
          slices={[
            {
              label: STATUS_NAMES.learned,
              value: stats.byStatus.learned,
              color: 'var(--brand)',
            },
            {
              label: STATUS_NAMES.learning,
              value: stats.byStatus.learning,
              color: 'var(--warn)',
            },
            {
              label: STATUS_NAMES['to-learn'],
              value: stats.byStatus['to-learn'],
              color: 'var(--track-strong)',
            },
          ]}
        />
      </Card>
      <Card className="space-y-4 xl:col-span-6 xl:col-start-1">
        <h2 className={TITLE}>Kategorie</h2>
        <Donut
          caption="Podział węzłów wg kategorii"
          format={(value) => String(value)}
          slices={stats.byCategory.map((c) => ({
            label: c.name,
            value: c.count,
            color: c.color,
          }))}
        />
      </Card>
      <Card className="space-y-4 xl:col-span-6 xl:col-start-1">
        <h2 className={TITLE}>Priorytety nauki</h2>
        <ul className="space-y-4">
          {stats.byPriority.map((entry) => (
            <li key={entry.level} className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-ink-soft">
                  {PRIORITY_NAMES[entry.level]}
                </span>
                <span className="font-medium tabular-nums">
                  {entry.learned} z {entry.count}
                </span>
              </div>
              <ProgressBar
                pct={
                  entry.count === 0 ? 0 : (entry.learned / entry.count) * 100
                }
                tone={PRIORITY_TONE[entry.level]}
                label={`Priorytet ${PRIORITY_NAMES[entry.level].toLowerCase()}: opanowane ${entry.learned} z ${entry.count}`}
              />
            </li>
          ))}
        </ul>
      </Card>
      {stats.topTags.length ? (
        <Card className="space-y-3 xl:col-span-6 xl:col-start-1">
          <h2 className={TITLE}>Popularne tagi</h2>
          <ul className="flex flex-wrap gap-2">
            {stats.topTags.map(({ tag, count }) => (
              <li
                key={tag}
                className="rounded-full bg-brand-softer px-3 py-1 text-xs"
              >
                #{tag}{' '}
                <span className="font-semibold tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
};
