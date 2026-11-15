import {
  CheckCircle2,
  Circle,
  LoaderCircle,
  Pencil,
  Trash2,
} from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import {
  changeProps,
  useEntrance,
  type ChangePhase,
} from '@/shared/ui/list-changes';
import {
  nextStatus,
  priorityLabel,
  priorityLevel,
  STATUS_NAMES,
} from '../domain/learning';
import type { KnowledgeNode } from '../domain/models';
import { useContext } from './context';
import { deleteNodeModal, editNodeModal } from './modal-ids';

const PRIORITY_TONE = {
  high: 'bg-danger-soft text-danger',
  medium: 'bg-hover text-ink',
  low: 'bg-brand-softer text-ink-soft',
} as const;

const ICON_BUTTON =
  'grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';

/** Node line: learning cycle, title, meta (category, priority, tags), edit and delete. */
export const NodeRow = ({
  node,
  step,
  phase = 'idle',
}: {
  node: KnowledgeNode;
  step: number;
  phase?: ChangePhase;
}) => {
  const { categories, priorities, updateNode } = useContext();
  const category = categories.find((c) => c.id === node.categoryId);
  const priority = priorities.find((p) => p.id === node.priorityId);
  const change = changeProps(phase);
  const entrance = useEntrance(phase);
  const learned = node.status === 'learned';
  return (
    <li
      data-e2e={`knowledge:node:${node.id}`}
      aria-hidden={change['aria-hidden']}
      inert={change.inert}
      onAnimationEnd={entrance.onAnimationEnd}
      style={
        entrance.entering
          ? { animationDelay: `${Math.min(step, 8) * 30}ms` }
          : undefined
      }
      className={cn(
        'flex items-start gap-0.5 rounded-2xl py-1 pl-1 pr-0.5 transition-colors duration-200 hover:bg-hover-soft motion-reduce:transition-none',
        entrance.entering && 'animate-item-in motion-reduce:animate-none',
        change.className,
      )}
    >
      <button
        type="button"
        role="checkbox"
        aria-checked={
          learned ? true : node.status === 'learning' ? 'mixed' : false
        }
        aria-label={`${STATUS_NAMES[node.status]}: ${node.title}. Zmień postęp`}
        data-e2e={`knowledge:node-status:${node.id}`}
        onClick={() => {
          const next = nextStatus(node.status);
          updateNode(
            { ...node, status: next },
            `Węzeł: ${STATUS_NAMES[next]}.`,
          );
        }}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {learned ? (
          <CheckCircle2
            className="h-5.5 w-5.5 fill-accent text-on-accent"
            aria-hidden="true"
          />
        ) : node.status === 'learning' ? (
          <LoaderCircle
            className="h-5 w-5 text-brand"
            strokeWidth={3}
            aria-hidden="true"
          />
        ) : (
          <Circle className="h-5.5 w-5.5 text-ink-soft" aria-hidden="true" />
        )}
      </button>
      <div className="flex min-w-0 flex-1 flex-col py-1.5">
        <p
          className={cn(
            'break-words text-sm font-medium',
            learned && 'text-ink-soft line-through',
          )}
        >
          {node.title}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          {category ? (
            <span className="inline-flex min-w-0 items-center gap-1">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <span className="truncate">{category.name}</span>
            </span>
          ) : null}
          {priority ? (
            <span
              className={cn(
                'rounded-full px-2 py-0.5 font-medium',
                PRIORITY_TONE[priorityLevel(priority.value)],
              )}
            >
              <span className="sr-only">Priorytet nauki: </span>
              {priorityLabel(priority)}
            </span>
          ) : null}
          {node.status === 'learning' ? (
            <span className="font-medium text-brand">
              {STATUS_NAMES.learning}
            </span>
          ) : null}
          {node.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-brand-softer px-2 py-0.5"
            >
              #{tag}
            </span>
          ))}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Edytuj węzeł: ${node.title}`}
        data-e2e={`knowledge:node-edit:${node.id}`}
        onClick={() => openModal(editNodeModal(node.id))}
        className={ICON_BUTTON}
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label={`Usuń węzeł: ${node.title}`}
        data-e2e={`knowledge:node-delete:${node.id}`}
        onClick={() => openModal(deleteNodeModal(node.id))}
        className={ICON_BUTTON}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </li>
  );
};
