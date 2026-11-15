import { useId, useState } from 'react';
import { BrainCog, ChevronDown, FolderPlus, Plus, SearchX } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { ClearableInput } from '@/shared/ui/clearable';
import { Button, ProgressBar } from '@/shared/ui/controls';
import { EmptyState } from '@/shared/ui/empty-state';
import { Card } from '@/shared/ui/layout';
import { useListChanges } from '@/shared/ui/list-changes';
import { openModal } from '@/shared/router/modal-stack';
import { BRAIN_AREAS } from '../domain/brain-area';
import { areaName } from '../domain/brain-area';
import { fillOf, filterNodes, sortByPriority } from '../domain/learning';
import type { Folder } from '../domain/models';
import { useContext } from './context';
import { newNodeInModal, NEW_FOLDER_MODAL, NEW_NODE_MODAL } from './modal-ids';
import { NodeRow } from './node-row';

const nodeKey = (node: { id: string }) => node.id;

const FolderCard = ({ folder }: { folder: Folder }) => {
  const { nodes, priorities, query, setHovered } = useContext();
  const [open, setOpen] = useState(true);
  const panel = useId();
  const own = nodes.filter((n) => n.folderId === folder.id);
  const shown = sortByPriority(filterNodes(own, query), priorities);
  const rows = useListChanges(shown, nodeKey, query);
  const area = BRAIN_AREAS.find((a) => a.id === folder.areaId);
  const learned = own.filter((n) => n.status === 'learned').length;
  const pct = fillOf(own) * 100;
  return (
    <li
      data-e2e={`knowledge:folder:${folder.id}`}
      onPointerEnter={() => setHovered(folder.areaId)}
      onPointerLeave={() => setHovered(null)}
      onFocus={() => setHovered(folder.areaId)}
      onBlur={() => setHovered(null)}
      className="flex flex-col gap-2 rounded-3xl border border-line bg-card p-3 shadow-card"
    >
      <div className="flex items-start gap-1">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panel}
          data-e2e={`knowledge:folder-toggle:${folder.id}`}
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl p-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-on-accent">
            <BrainCog className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {folder.name}
            </span>
            <span className="block truncate text-xs text-ink-soft">
              {area?.name} · {area?.role}
            </span>
          </span>
          <span className="shrink-0 text-xs tabular-nums text-ink-soft">
            {learned} z {own.length}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-ink-soft transition-transform motion-reduce:transition-none',
              !open && '-rotate-90',
            )}
            aria-hidden="true"
          />
        </button>
        <button
          type="button"
          aria-label={`Dodaj węzeł do folderu: ${folder.name}`}
          data-e2e={`knowledge:folder-new-node:${folder.id}`}
          onClick={() => openModal(newNodeInModal(folder.id))}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <ProgressBar
        pct={pct}
        label={`Folder ${folder.name}: wiedza w ${Math.round(pct)}%`}
      />
      <div id={panel} hidden={!open}>
        {rows.length ? (
          <ul className="flex flex-col">
            {rows.map(({ key, item, phase, at }) => (
              <NodeRow key={key} node={item} phase={phase} step={at} />
            ))}
          </ul>
        ) : (
          <p className="px-2 py-3 text-center text-xs text-ink-soft">
            {query.trim()
              ? `Brak węzłów dla „${query.trim()}” w tym folderze.`
              : 'Pusty folder. Dodaj pierwszy węzeł.'}
          </p>
        )}
      </div>
    </li>
  );
};

/** Folders of knowledge, each tied to a brain area, with the nodes inside. */
export const Folders = () => {
  const { folders, nodes, query, setQuery, area, clearArea } = useContext();
  const visible = folders.filter((f) => area === null || f.areaId === area);
  const phrase = query.trim();
  const matching = new Set(
    filterNodes(nodes, query).map((n) => n.folderId as string),
  );
  // With a phrase, folders without a hit drop out.
  const listed = phrase ? visible.filter((f) => matching.has(f.id)) : visible;
  return (
    <Card
      as="section"
      aria-labelledby="knowledge-folders"
      className="flex flex-col gap-3 md:gap-4 xl:col-span-6 xl:col-start-7 xl:row-span-3 xl:row-start-1"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="knowledge-folders" className="text-base font-semibold">
          Foldery wiedzy
        </h2>
        <Button
          variant="ghost"
          data-e2e="knowledge:folder-add"
          onClick={() => openModal(NEW_FOLDER_MODAL)}
          className="w-auto px-3 py-2"
        >
          <FolderPlus className="h-4 w-4" aria-hidden="true" /> Nowy folder
        </Button>
      </div>
      <ClearableInput
        type="search"
        data-e2e="knowledge:search"
        aria-label="Szukaj w wiedzy"
        placeholder="Szukaj węzłów i tagów"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />
      {area ? (
        <p className="flex items-center justify-between gap-2 rounded-2xl bg-accent-soft px-3 py-2 text-xs text-on-accent">
          <span>Obszar: {areaName(area)}</span>
          <button
            type="button"
            onClick={clearArea}
            className="rounded-md font-semibold underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Pokaż wszystkie
          </button>
        </p>
      ) : null}
      {folders.length === 0 ? (
        <EmptyState
          data-e2e="knowledge:empty"
          icon={BrainCog}
          title="Mózg czeka na wiedzę"
          description="Załóż folder, wskaż obszar mózgu i dodaj pierwszy węzeł."
          action={
            <Button
              onClick={() => openModal(NEW_NODE_MODAL)}
              className="w-auto px-3 py-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" /> Dodaj węzeł
            </Button>
          }
        />
      ) : listed.length === 0 ? (
        <EmptyState
          data-e2e="knowledge:empty-search"
          icon={SearchX}
          title="Nic nie znaleziono"
          description={
            phrase
              ? `Brak wyników dla „${phrase}”${area ? ` w obszarze ${areaName(area)}` : ''}.`
              : 'Ten obszar nie ma jeszcze folderów.'
          }
        />
      ) : (
        <ul data-e2e="knowledge:folders" className="flex flex-col gap-3">
          {listed.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </ul>
      )}
    </Card>
  );
};
