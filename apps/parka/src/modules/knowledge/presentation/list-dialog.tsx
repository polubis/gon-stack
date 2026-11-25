import {
  ChevronRight,
  FolderTree,
  Layers,
  Plus,
  Tags,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { Button } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import {
  changeProps,
  useEntrance,
  useListChanges,
  type ChangePhase,
} from '@/shared/ui/list-changes';
import { useContext } from './context';
import { editModal, newModal, type ListEntity } from './modal-ids';
import { ModalShell } from './modal-shell';
import { stagger } from './stagger';

type Row = { id: string; name: string; hint?: string; color?: string };

const COPY: Record<
  ListEntity,
  {
    title: string;
    description: string;
    empty: string;
    icon: LucideIcon;
    noun: string;
  }
> = {
  category: {
    title: 'Kategorie',
    description: 'Kategorie grupują katalogi i wypełniają obszary mózgu.',
    empty: 'Nie masz jeszcze kategorii',
    icon: Layers,
    noun: 'kategorię',
  },
  catalog: {
    title: 'Katalogi',
    description: 'Katalogi zbierają tematy jednej dziedziny.',
    empty: 'Nie masz jeszcze katalogów',
    icon: FolderTree,
    noun: 'katalog',
  },
  tag: {
    title: 'Tagi',
    description: 'Tagi porządkują tematy niezależnie od katalogów.',
    empty: 'Nie masz jeszcze tagów',
    icon: Tags,
    noun: 'tag',
  },
};

const ListRow = ({
  row,
  copy,
  entity,
  phase,
  at,
}: {
  row: Row;
  copy: { noun: string };
  entity: ListEntity;
  phase: ChangePhase;
  at: number;
}) => {
  const change = changeProps(phase);
  const entrance = useEntrance(phase);
  return (
    <li
      aria-hidden={change['aria-hidden']}
      inert={change.inert}
      onAnimationEnd={entrance.onAnimationEnd}
      style={entrance.entering ? stagger(at) : undefined}
      className={cn(
        'border-b border-line last:border-0',
        entrance.entering && 'animate-item-in motion-reduce:animate-none',
        change.className,
      )}
    >
      <button
        type="button"
        aria-label={`Edytuj ${copy.noun}: ${row.name}`}
        data-e2e={`knowledge:list-edit:${row.id}`}
        onClick={() => openModal(editModal(entity, row.id))}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-hover-soft focus-visible:bg-hover-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
      >
        {row.color ? (
          <span
            aria-hidden="true"
            className="size-4 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{row.name}</span>
          {row.hint ? (
            <span className="block truncate text-xs text-ink-soft">
              {row.hint}
            </span>
          ) : null}
        </span>
        <ChevronRight className="size-5 text-ink-soft" aria-hidden="true" />
      </button>
    </li>
  );
};

/** Browse list of categories, catalogs or tags; a row opens its form. */
export const ListDialog = ({
  modal,
  entity,
}: {
  modal: string;
  entity: ListEntity;
}) => {
  const { categories, catalogs, tags } = useContext();
  const copy = COPY[entity];
  const rows: Row[] =
    entity === 'category'
      ? categories.map((c) => ({ id: c.id, name: c.name, color: c.color }))
      : entity === 'catalog'
        ? catalogs.map((c) => ({
            id: c.id,
            name: c.name,
            hint:
              categories.find((x) => x.id === c.categoryId)?.name ??
              'Bez kategorii',
          }))
        : tags.map((t) => ({ id: t.id, name: t.name }));
  const changes = useListChanges(rows, (r) => r.id, entity);
  const add = (
    <Button
      data-e2e="knowledge:list-add"
      onClick={() => openModal(newModal(entity))}
      className="w-auto px-3 py-2"
    >
      <Plus className="size-4" aria-hidden="true" /> Dodaj
    </Button>
  );
  return (
    <ModalShell
      modal={modal}
      data-e2e="knowledge:list-dialog"
      title={copy.title}
      description={copy.description}
    >
      {rows.length === 0 ? (
        <EmptyState
          icon={copy.icon}
          title={copy.empty}
          description={`Dodaj pierwszą ${copy.noun}.`}
          action={add}
        />
      ) : (
        <>
          <div className="mb-3 flex justify-end">{add}</div>
          <ul className="max-h-80 overflow-y-auto overflow-x-hidden rounded-2xl border border-line bg-card">
            {changes.map(({ key, item, phase, at }) => (
              <ListRow
                key={key}
                row={item}
                copy={copy}
                entity={entity}
                phase={phase}
                at={at}
              />
            ))}
          </ul>
        </>
      )}
    </ModalShell>
  );
};
