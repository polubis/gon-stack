import { useState } from 'react';
import { TOPICS_PREVIEW } from '../configuration/constraints';
import type { Catalog, Topic } from '../domain/models';
import { useContext } from './context';
import { useListChanges } from '@/shared/ui/list-changes';
import { Button } from '@/shared/ui/controls';
import { TopicRow } from './topic-row';

/** Flat rows; a long list folds behind "Pokaż więcej". */
const Rows = ({
  topics,
  scope,
  folded,
  moreId,
}: {
  topics: Topic[];
  scope: string;
  folded: boolean;
  moreId: string;
}) => {
  const [all, setAll] = useState(false);
  const rows = useListChanges(topics, (t) => t.id, scope);
  const live = rows.filter((row) => row.phase !== 'out');
  const shown =
    folded && !all ? live.slice(0, TOPICS_PREVIEW).map((r) => r.key) : null;
  const hidden = shown ? live.length - shown.length : 0;
  return (
    <>
      <ul className="flex flex-col">
        {rows
          .filter(
            (row) =>
              shown === null || row.phase === 'out' || shown.includes(row.key),
          )
          .map((row) => (
            <TopicRow key={row.key} topic={row.item} phase={row.phase} />
          ))}
      </ul>
      {hidden > 0 ? (
        <Button
          variant="ghost"
          className="w-auto self-start px-3 py-1.5 text-xs"
          data-e2e={`knowledge:topic-more:${moreId}`}
          onClick={() => setAll(true)}
        >
          Pokaż więcej ({hidden})
        </Button>
      ) : null}
    </>
  );
};

/**
 * Topics as one flat list. `grouped` (topics of many catalogs, f.e. backlog)
 * adds a plain catalog heading per group, like the finance lists.
 * `scope` resets the change animations.
 */
export const TopicList = ({
  topics,
  scope,
  folded = true,
  grouped = false,
}: {
  topics: Topic[];
  scope: string;
  folded?: boolean;
  grouped?: boolean;
}) => {
  const { catalogs } = useContext();
  if (!grouped) {
    return (
      <div data-e2e="knowledge:list" className="flex flex-col gap-1">
        <Rows topics={topics} scope={scope} folded={folded} moreId="all" />
      </div>
    );
  }
  const groups = catalogs
    .map((catalog) => ({
      catalog,
      own: topics.filter((t) => t.catalogId === catalog.id),
    }))
    .filter(
      (group): group is { catalog: Catalog; own: Topic[] } =>
        group.own.length > 0,
    );
  return (
    <div data-e2e="knowledge:list" className="flex flex-col gap-4">
      {groups.map(({ catalog, own }) => (
        <section
          key={catalog.id}
          aria-label={`Katalog: ${catalog.name}`}
          data-e2e={`knowledge:catalog:${catalog.id}`}
          className="flex flex-col gap-1"
        >
          <h3 className="truncate px-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {catalog.name}
          </h3>
          <Rows
            topics={own}
            scope={scope}
            folded={folded}
            moreId={catalog.id}
          />
        </section>
      ))}
    </div>
  );
};
