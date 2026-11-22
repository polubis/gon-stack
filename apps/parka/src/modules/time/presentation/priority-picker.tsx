import { cn } from '@repo/react-kit/cn';
import { openModal } from '@/shared/router/modal-stack';
import { Field, Select } from '@/shared/ui/controls';
import { ManageLink } from '@/shared/ui/manage-link';
import { priorityLevel } from '../domain/priority';
import type { PriorityId } from '../domain/models';
import { useContext } from './context';
import { PRIORITIES_MODAL } from './modal-ids';
import { PriorityMeter, PRIORITY_TONE } from './priority-badge';

/** Select of the priorities (highest value first), with the link to manage them. */
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
      required
      label="Priorytet"
      action={
        <ManageLink
          aria-label="Zarządzaj priorytetami"
          data-e2e="time:priority-manage"
          onClick={() => openModal(PRIORITIES_MODAL)}
        />
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
