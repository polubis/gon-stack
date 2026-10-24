import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { priorityLevel } from '../domain/priority';
import type { PriorityId } from '../domain/models';
import { useContext } from './context';
import { NEW_PRIORITY_MODAL } from './modal-ids';
import { PICKER_LINK } from './picker-link';
import { PRIORITY_ICON, PRIORITY_TONE } from './priority-badge';

/** Radio segments of the priorities (sorted by value), with a link to add one. */
export const PriorityPicker = ({
  value,
  onChange,
}: {
  value: PriorityId | undefined;
  onChange: (id: PriorityId) => void;
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
          const Icon = PRIORITY_ICON[level];
          const selected = item.id === value;
          return (
            <label
              key={item.id}
              className={cn(
                'flex h-9 min-w-24 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand',
                selected
                  ? cn(
                      PRIORITY_TONE[level],
                      'bg-card shadow-sm ring-2 ring-current',
                    )
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
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
