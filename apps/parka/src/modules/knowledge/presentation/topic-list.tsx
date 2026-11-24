import { useState } from 'react';
import { Plus } from 'lucide-react';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { useListChanges } from '@/shared/ui/list-changes';
import { TOPICS_PREVIEW } from '../configuration/constraints';
import { groupTopics } from '../domain/learning';
import type { Catalog, Topic } from '../domain/models';
import { useContext } from './context';
import { newTopicInModal } from './modal-ids';
import { TopicRow } from './topic-row';

/** Rows of one catalog; a long list folds behind "Pokaż więcej". */
const CatalogSection = ({
  catalog,
  topics,
  scope,
  folded,
}: {
  catalog: Catalog;
  topics: Topic[];
  scope: string;
  folded: boolean;
}) => {
  const [all, setAll] = useState(false);
  const rows = useListChanges(topics, (t) => t.id, scope);
  const live = rows.filter((row) => row.phase !== 'out');
  const shown =
    folded && !all ? live.slice(0, TOPICS_PREVIEW).map((r) => r.key) : null;
  const hidden = shown ? live.length - shown.length : 0;
  return (
    <section
      aria-label={`Katalog: ${catalog.name}`}
      data-e2e={`knowledge:catalog:${catalog.id}`}
      className="flex flex-col gap-1"
    >
      <div className="flex items-center justify-between gap-2">
        <h4 className="min-w-0 truncate text-sm font-semibold">
          {catalog.name}
        </h4>
        <button
          type="button"
          aria-label={`Dodaj temat do katalogu: ${catalog.name}`}
          onClick={() => openModal(newTopicInModal(catalog.id))}
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
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
          data-e2e={`knowledge:topic-more:${catalog.id}`}
          onClick={() => setAll(true)}
        >
          Pokaż więcej ({hidden})
        </Button>
      ) : null}
    </section>
  );
};

/** Topics by category (area), then catalog. `scope` resets the change animations. */
export const TopicList = ({
  topics,
  scope,
  folded = true,
}: {
  topics: Topic[];
  scope: string;
  folded?: boolean;
}) => {
  const { categories, catalogs } = useContext();
  const groups = groupTopics(categories, catalogs, topics);
  return (
    <div data-e2e="knowledge:list" className="flex flex-col gap-4">
      {groups.map((group) => (
        <section
          key={group.category?.id ?? 'none'}
          aria-label={`Kategoria: ${group.category?.name ?? 'Bez kategorii'}`}
          data-e2e={`knowledge:category:${group.category?.id ?? 'none'}`}
          className="flex flex-col gap-2"
        >
          <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full bg-line-strong"
              style={
                group.category
                  ? { backgroundColor: group.category.color }
                  : undefined
              }
            />
            {group.category?.name ?? 'Bez kategorii'}
          </h3>
          {group.catalogs.map(({ catalog, topics: own }) => (
            <CatalogSection
              key={catalog.id}
              catalog={catalog}
              topics={own}
              scope={scope}
              folded={folded}
            />
          ))}
        </section>
      ))}
    </div>
  );
};
