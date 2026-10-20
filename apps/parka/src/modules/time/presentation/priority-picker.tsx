import { ArrowDown, ArrowUp, Minus, Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import {
  priorityLabel,
  priorityLevel,
  type PriorityLevel,
} from '../domain/priority';
import { useContext } from './lists-context';
import { NEW_PRIORITY_MODAL } from './modal-ids';
import { PICKER_LINK } from './picker-link';

const ICON = {
  low: ArrowDown,
  medium: Minus,
  high: ArrowUp,
} satisfies Record<PriorityLevel, unknown>;

const ICON_CLASS: Record<PriorityLevel, string> = {
  low: 'text-ink-soft',
  medium: 'text-brand',
  high: 'text-danger',
};

/** Radio segments of the priorities (sorted by value), with a link to add one. */
export const PriorityPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) => {
  const { priorities } = useContext();
  return (
    <fieldset className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <legend className="text-sm font-medium text-ink-soft">Priorytet</legend>
        <button
          type="button"
          onClick={() => openModal(NEW_PRIORITY_MODAL)}
          className={PICKER_LINK}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Nowy priorytet
        </button>
      </div>
      <div className="flex flex-wrap gap-1 rounded-xl bg-brand-soft p-1">
        {priorities.map((item) => {
          const level = priorityLevel(item.value);
          const Icon = ICON[level];
          const selected = item.id === value;
          return (
            <label
              key={item.id}
              className={cn(
                'flex h-9 min-w-24 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                selected
                  ? 'bg-card text-brand-dark shadow-sm'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              <input
                type="radio"
                name="task-priority"
                value={item.id}
                checked={selected}
                onChange={() => onChange(item.id)}
                className="sr-only"
              />
              <Icon
                className={cn('h-4 w-4 shrink-0', ICON_CLASS[level])}
                aria-hidden="true"
              />
              <span className="truncate">{priorityLabel(item)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
