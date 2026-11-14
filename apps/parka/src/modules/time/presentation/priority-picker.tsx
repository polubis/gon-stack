import { Plus } from 'lucide-react';
import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { Field, Select } from '@/shared/ui/controls';
import { priorityLevel } from '../domain/priority';
import type { PriorityId } from '../domain/models';
import { useContext } from './context';
import { NEW_PRIORITY_MODAL } from './modal-ids';
import { PICKER_LINK } from './picker-link';
import { PriorityMeter, PRIORITY_TONE } from './priority-badge';

/** Select of the priorities (highest value first), with the one link to add one. */
export const PriorityPicker = ({
  value,
  onChange,
}: {
  value: PriorityId | undefined;
  onChange: (id: PriorityId) => void;
}) => {
  const { priorities } = useContext();
  return (
    <Field
      label="Priorytet"
      action={
        <button
          type="button"
          onClick={() => openModal(NEW_PRIORITY_MODAL)}
          className={PICKER_LINK}
        >
          <Plus className="h-3 w-3" aria-hidden="true" />
          Nowy priorytet
        </button>
      }
    >
      <Select
        data-e2e="time:priority-select"
        value={value ?? ''}
        options={priorities.map((item) => ({
          value: item.id,
          label: (
            <span
              className={cn(
                'flex items-center gap-2',
                PRIORITY_TONE[priorityLevel(item.value)],
                'bg-transparent',
              )}
            >
              <PriorityMeter value={item.value} />
              <span className="truncate text-ink">{item.name}</span>
            </span>
          ),
        }))}
        // Radix reports '' while its list catches up with a new item: ignored.
        onValueChange={(id) => {
          const picked = priorities.find((item) => item.id === id);
          if (picked) onChange(picked.id);
        }}
      />
    </Field>
  );
};
